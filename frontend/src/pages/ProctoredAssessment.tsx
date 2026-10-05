import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { Camera, ShieldAlert, CheckCircle, AlertTriangle, Monitor, UserCheck, Play } from 'lucide-react';
import AssessmentActive from './AssessmentActive';

export default function ProctoredAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<'CONSENT' | 'CHECK' | 'ACTIVE'>('CONSENT');
  
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // States: SETUP -> LIVE -> GRACE_PERIOD -> LOST
  const [cameraState, setCameraState] = useState<'SETUP' | 'LIVE' | 'GRACE_PERIOD' | 'LOST'>('SETUP');
  const cameraStateRef = useRef(cameraState);
  
  const [events, setEvents] = useState<any[]>([]);
  const [camStatus, setCamStatus] = useState<'PENDING' | 'PASS' | 'FAIL'>('PENDING');
  const [faceStatus, setFaceStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'WAITING' | 'NO_FACE'>('IDLE');
  
  const [faceModel, setFaceModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const noFaceCountRef = useRef(0);
  
  const graceTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const model = await blazeface.load();
        setFaceModel(model);
        console.log('[Face AI] Model loaded securely in browser');
      } catch (e) {
        console.error('[Face AI] Failed to load', e);
      }
    };
    loadModel();
  }, []);

  const updateCameraState = (newState: 'SETUP' | 'LIVE' | 'GRACE_PERIOD' | 'LOST') => {
    console.log(`[Camera State] ${cameraStateRef.current} -> ${newState}`);
    cameraStateRef.current = newState;
    setCameraState(newState);
  };

  // Assign stream and forcibly play
  useEffect(() => {
    const video = videoRef.current;
    if (video && cameraStream) {
      if (video.srcObject !== cameraStream) {
        console.log('[Camera] stream attached');
        video.srcObject = cameraStream;
      }
      video.play().catch(e => console.error('[Camera] Video playback failed:', e));
    }
  }, [cameraStream, step]);

  const requestCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      console.log('[Camera] getUserMedia requested');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('[Camera] getUserMedia success');
      
      setCameraStream(stream);
      setCamStatus('PASS');
      setFaceStatus('WAITING');
    } catch (err) {
      console.error('[Camera] Access denied:', err);
      setCamStatus('FAIL');
      setFaceStatus('IDLE');
      if (step === 'ACTIVE') {
        alert("Camera permission is required. Your browser has blocked camera access. Enable camera permission and click Retry Camera.");
      }
    }
  };

  const startExam = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/proctoring/${id}/status`, { status: 'ACTIVE' }, { headers: { Authorization: `Bearer ${token}` }});
      setStep('ACTIVE');
      updateCameraState('LIVE'); // Will immediately be checked by active monitor
    } catch (error) {
      alert('Failed to start proctoring session');
    }
  };

  const logEvent = async (eventType: string, severity: string, description: string, confidence: number = 95) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/proctoring/${id}/event`, {
        eventType, severity, confidence, description
      }, { headers: { Authorization: `Bearer ${token}` }});
      setEvents(prev => [...prev, { eventType, time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      console.error('Failed to log event', err);
    }
  };

  // Robust Health Check
  const checkVideoHealth = () => {
    const video = videoRef.current;
    if (!video || !cameraStream) return false;
    
    const track = cameraStream.getVideoTracks()[0];
    if (!track) return false;
    
    // Check Track
    if (track.readyState !== 'live' || !track.enabled || track.muted) {
      return false;
    }
    
    // Check Video Element frames
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return false;
    }

    return true;
  };

  // Setup Monitor (Verifies actual frames AND real face detection before allowing Start)
  useEffect(() => {
    if (step !== 'CHECK' || camStatus !== 'PASS') return;
    
    let isActive = true;
    let lastTime = -1;

    const setupMonitor = setInterval(async () => {
      const video = videoRef.current;
      let isHealthy = checkVideoHealth();
      
      if (isHealthy && video) {
        if (video.currentTime === lastTime) isHealthy = false;
        lastTime = video.currentTime;
      }

      if (!isHealthy) {
        setFaceStatus('WAITING');
        return;
      }
      
      // If healthy and we have the model, do real CV!
      if (faceModel && video) {
        if (faceStatus === 'IDLE' || faceStatus === 'WAITING') {
          setFaceStatus('SCANNING');
        }
        
        try {
          const predictions = await faceModel.estimateFaces(video, false);
          if (!isActive) return;
          
          if (predictions.length > 0) {
            setFaceStatus('VERIFIED');
          } else {
            setFaceStatus('NO_FACE');
          }
        } catch (e) {
          console.error('[Face AI] Inference error', e);
        }
      }
    }, 1000);

    return () => {
      isActive = false;
      clearInterval(setupMonitor);
    };
  }, [step, camStatus, cameraStream, faceModel]);

  // Active Monitor
  useEffect(() => {
    if (step !== 'ACTIVE') return;

    let lastTime = -1;

    const handleLost = () => {
      if (cameraStateRef.current === 'LIVE') {
        console.log('[Camera] Stream lost. Entering GRACE_PERIOD');
        updateCameraState('GRACE_PERIOD');
        graceTimeoutRef.current = setTimeout(() => {
          if (cameraStateRef.current === 'GRACE_PERIOD') {
            console.log('[Camera] Grace period expired. Entering LOST');
            updateCameraState('LOST');
            logEvent('CAMERA_LOST', 'HIGH_REVIEW', 'Camera stream became unavailable during assessment');
          }
        }, 5000);
      }
    };

    const handleRestored = () => {
      const prevState = cameraStateRef.current;
      if (prevState === 'GRACE_PERIOD' || prevState === 'LOST') {
        console.log('[Camera] Stream restored');
        if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
        updateCameraState('LIVE');
        if (prevState === 'LOST') {
          logEvent('CAMERA_RESTORED', 'INFO', 'Camera stream restored and verified.');
        }
      }
    };

    let isActive = true;

    const monitor = setInterval(async () => {
      if (!isActive) return;
      const video = videoRef.current;
      let isHealthy = checkVideoHealth();
      
      if (isHealthy && video) {
        if (video.currentTime === lastTime) isHealthy = false;
        lastTime = video.currentTime;
      }

      if (!isHealthy && cameraStateRef.current === 'LIVE') handleLost();
      if (isHealthy && (cameraStateRef.current === 'GRACE_PERIOD' || cameraStateRef.current === 'LOST')) handleRestored();

      // Real Face Validation!
      if (isHealthy && cameraStateRef.current === 'LIVE' && faceModel && video) {
        try {
          const predictions = await faceModel.estimateFaces(video, false);
          if (!isActive) return;

          if (predictions.length === 0) {
            noFaceCountRef.current += 1;
            console.warn(`[Face AI] Face missing... (${noFaceCountRef.current}/5)`);
            if (noFaceCountRef.current >= 5) {
               logEvent('FACE_NOT_VISIBLE', 'CRITICAL', 'Student face completely vanished from camera.');
               alert("SECURITY VIOLATION: Face no longer detected. Your assessment has been terminated.");
               endAssessment();
            }
          } else if (predictions.length > 1) {
            logEvent('MULTIPLE_PERSON', 'HIGH_REVIEW', 'Multiple faces detected in frame');
            noFaceCountRef.current = 0;
          } else {
            noFaceCountRef.current = 0; // Reset
          }
        } catch(e) {}
      }
    }, 1000);

    const handleVisibility = () => {
      if (document.hidden) logEvent('TAB_SWITCH', 'HIGH_REVIEW', 'Student switched to another tab or application.');
    };

    const handleDeviceChange = () => {
      console.log('[Camera] Device change detected');
      if (!checkVideoHealth()) handleLost();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      isActive = false;
      clearInterval(monitor);
      document.removeEventListener('visibilitychange', handleVisibility);
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
    };
  }, [step, cameraStream]);

  // Heartbeat
  useEffect(() => {
    if (step !== 'ACTIVE' || cameraState === 'LOST') return;
    const token = localStorage.getItem('token');
    const interval = setInterval(() => {
      axios.post(`http://localhost:5000/api/proctoring/${id}/heartbeat`, {}, { headers: { Authorization: `Bearer ${token}` }})
        .catch(console.error);
    }, 30000);
    return () => clearInterval(interval);
  }, [step, cameraState, id]);

  const endAssessment = (reason?: string) => {
    if (reason) {
      console.log(`[ASSESSMENT TERMINATION DEBUG] reason: ${reason}`);
    }
    navigate(`/assessment/${id}/result`, { state: { terminationReason: reason } });
  };

  const simulateCameraDeath = () => {
    console.log('[Camera] Triggering simulated disconnect');
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => {
        t.stop();
        t.dispatchEvent(new Event('ended'));
      });
    }
  };

  if (step === 'CONSENT') {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-sage/20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="text-forest" size={32} />
            <h1 className="text-2xl font-bold text-ink">AI Proctored Assessment</h1>
          </div>
          
          <div className="space-y-4 text-forest-dark/70">
            <p>This assessment is securely monitored by SkillPath AI to ensure academic integrity. Before starting, please review the rules:</p>
            <ul className="list-disc pl-6 space-y-2 font-medium">
              <li>Your webcam and microphone will remain active during the entire exam.</li>
              <li>You must remain in the camera frame at all times.</li>
              <li>No other persons are allowed in the room.</li>
              <li>No mobile phones, secondary devices, or external materials are permitted.</li>
              <li>Navigating away from this tab will be recorded as a security violation.</li>
            </ul>
          </div>

          <button onClick={() => setStep('CHECK')} className="w-full mt-8 bg-forest text-white font-bold py-3 rounded-lg hover:bg-forest-dark transition-colors">
            I Agree, Proceed to System Check
          </button>
        </div>
      </div>
    );
  }

  if (step === 'CHECK') {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-sage/20 text-center">
          <h2 className="text-2xl font-bold text-ink mb-6">System & Identity Check</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-cream/50 p-6 rounded-xl border border-sage/20">
              <Monitor className="mx-auto mb-4 text-muted" size={32} />
              <h3 className="font-bold text-forest-dark mb-4">Hardware Access</h3>
              {camStatus === 'PENDING' && <button onClick={requestCamera} className="bg-forest text-white px-4 py-2 rounded-lg font-bold">Enable Camera & Mic</button>}
              {camStatus === 'PASS' && <div className="text-forest font-bold flex items-center justify-center gap-2"><CheckCircle size={20} /> Permissions Granted</div>}
              {camStatus === 'FAIL' && <div className="text-red-600 font-bold flex items-center justify-center gap-2"><AlertTriangle size={20} /> Access Denied</div>}
            </div>
            
            <div className="bg-cream/50 p-6 rounded-xl border border-sage/20">
              <UserCheck className="mx-auto mb-4 text-muted" size={32} />
              <h3 className="font-bold text-forest-dark mb-4">Identity & Environment</h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden relative border-2 border-ink">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                
                {faceStatus === 'WAITING' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <span className="text-muted text-sm">Waiting for live video frames...</span>
                  </div>
                )}
                
                {faceStatus === 'NO_FACE' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/40">
                    <span className="text-white font-bold bg-red-600 px-3 py-1 rounded">No Face Detected!</span>
                  </div>
                )}

                {faceStatus === 'SCANNING' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-forest-dark/40 backdrop-blur-sm">
                    <div className="w-16 h-16 border-4 border-forest border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-white font-bold tracking-widest text-sm animate-pulse">AI SCANNING FACE...</span>
                  </div>
                )}

                {faceStatus === 'VERIFIED' && (
                  <div className="absolute inset-0 border-4 border-sage pointer-events-none">
                    <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white font-bold bg-forest/90 py-1 uppercase tracking-wider">
                      <CheckCircle size={14} className="inline mr-1 -mt-0.5" /> Face Verified
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button onClick={startExam} disabled={faceStatus !== 'VERIFIED'} className="w-full bg-forest text-white font-bold py-3 rounded-lg hover:bg-forest disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
            {faceStatus === 'VERIFIED' ? <><CheckCircle size={20} /> I am alone and ready to begin</> : 'Awaiting Live Video & Face Verification...'}
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE STEP
  return (
    <div className="relative">
      
      {/* CAMERA LOST / PAUSED OVERLAY */}
      {cameraState === 'LOST' && (
        <div className="absolute inset-0 z-50 bg-forest/95 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-10 rounded-2xl max-w-lg w-full text-center shadow-2xl border-4 border-red-500">
            <AlertTriangle className="mx-auto text-red-500 mb-6" size={64} />
            <h2 className="text-3xl font-black text-ink mb-4">CAMERA CONNECTION LOST</h2>
            <div className="bg-red-50 text-red-800 p-4 rounded-lg font-medium mb-6">
              Your assessment has been PAUSED.<br/>
              Your camera must remain active throughout the assessment.
            </div>
            <div className="flex gap-4">
              <button onClick={requestCamera} className="flex-1 bg-forest text-white py-3 rounded-xl font-bold hover:bg-forest-dark transition">
                Retry Camera
              </button>
              <button onClick={endAssessment} className="flex-1 bg-sage/20 text-forest-dark py-3 rounded-xl font-bold hover:bg-sage/30 transition">
                End Assessment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* GRACE PERIOD OVERLAY */}
      {cameraState === 'GRACE_PERIOD' && (
        <div className="absolute inset-0 z-50 bg-forest/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center border-4 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-600 mb-2">Camera Connection Interrupted</h3>
            <p className="text-forest-dark/70 font-medium">Reconnecting... please wait.</p>
          </div>
        </div>
      )}

      {/* Mini Proctoring Overlay */}
      <div className="absolute top-0 right-0 z-40 flex flex-col gap-4 w-64 pointer-events-none">
        <div className="bg-forest rounded-xl overflow-hidden shadow-xl border-2 border-sage pointer-events-auto">
          <div className={`text-white text-[10px] font-bold px-2 py-1 flex justify-between items-center uppercase tracking-wider ${
            cameraState === 'LIVE' ? 'bg-forest' :
            cameraState === 'GRACE_PERIOD' ? 'bg-yellow-500' : 'bg-red-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cameraState === 'LIVE' ? 'bg-red-500 animate-pulse' : 'bg-white'}`}></span>
              {cameraState === 'LIVE' ? '🟢 Proctoring Active' : '⚠ Proctoring Paused'}
            </div>
            <span>
              {cameraState === 'LIVE' ? 'CONNECTED' : cameraState === 'GRACE_PERIOD' ? 'RECONNECTING' : 'DISCONNECTED'}
            </span>
          </div>
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-32 object-cover transform -scale-x-100 bg-black" />
        </div>

        <div className="bg-white p-3 rounded-xl shadow-xl border border-sage/20 pointer-events-auto">
          <h4 className="text-xs font-bold text-muted uppercase mb-2 border-b pb-1">Demo Mode Triggers</h4>
          <div className="space-y-2">
            <button onClick={simulateCameraDeath} className="w-full text-left text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Trigger: Camera Disconnect</button>
            <button onClick={() => logEvent('MULTIPLE_PERSON', 'HIGH_REVIEW', 'Second face detected')} className="w-full text-left text-xs bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Trigger: Multiple Persons</button>
            <button onClick={() => {
              logEvent('FACE_NOT_VISIBLE', 'CRITICAL', 'Student face not detected. Exam auto-terminated.');
              alert("SECURITY VIOLATION: Face not detected. Your assessment has been terminated.");
              endAssessment();
            }} className="w-full text-left text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-bold shadow">
              Trigger: Face Not Visible (Auto-Fail)
            </button>
          </div>
          {events.length > 0 && (
            <div className="mt-3 pt-2 border-t text-[10px] text-muted max-h-24 overflow-y-auto">
              {events.map((e, i) => (
                <div key={i} className="mb-1">{e.time} - {e.eventType}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`pr-72 transition-opacity ${cameraState !== 'LIVE' ? 'opacity-20 pointer-events-none blur-sm' : ''}`}>
        <AssessmentActive isWrapped={true} isPaused={cameraState !== 'LIVE'} onEndAssessment={endAssessment} />
      </div>
    </div>
  );
}
