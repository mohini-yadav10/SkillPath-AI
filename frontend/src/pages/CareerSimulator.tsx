import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, ArrowRight, Zap, ArrowUpCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CareerSimulator() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [simulatedSkills, setSimulatedSkills] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/analysis/skill-gap/latest', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.data;
        setAnalysis(data);
        
        // Initialize simulated skills with current levels
        if (data && data.gaps) {
          const initialSkills: Record<string, number> = {};
          data.gaps.forEach((gap: any) => {
            initialSkills[gap.skillId] = gap.currentProficiency;
          });
          setSimulatedSkills(initialSkills);
        }
      } catch (error) {
        console.error("Error fetching analysis", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleSkillChange = (skillId: string, value: number) => {
    setSimulatedSkills(prev => ({
      ...prev,
      [skillId]: value
    }));
  };

  const calculateReadiness = (skills: Record<string, number>) => {
    if (!analysis || !analysis.gaps) return 0;
    
    let totalScoreNumerator = 0;
    let totalScoreDenominator = 0;

    analysis.gaps.forEach((gap: any) => {
      const currentProficiency = skills[gap.skillId] || 0;
      const requiredProficiency = gap.requiredProficiency;
      
      let weight = 1;
      if (gap.importance === 'CRITICAL') weight = 3;
      else if (gap.importance === 'IMPORTANT') weight = 2;
      else if (gap.importance === 'OPTIONAL') weight = 0.5;

      totalScoreNumerator += (Math.min(currentProficiency, requiredProficiency) / requiredProficiency) * weight;
      totalScoreDenominator += weight;
    });

    return totalScoreDenominator > 0 ? Math.round((totalScoreNumerator / totalScoreDenominator) * 100) : 0;
  };

  const currentReadiness = analysis?.readinessScore || 0;
  const simulatedReadiness = useMemo(() => calculateReadiness(simulatedSkills), [simulatedSkills, analysis]);
  const readinessChange = simulatedReadiness - currentReadiness;

  // Calculate impacts of simulated changes
  const skillImpacts = useMemo(() => {
    if (!analysis || !analysis.gaps) return [];
    
    return analysis.gaps.map((gap: any) => {
      const original = gap.currentProficiency;
      const simulated = simulatedSkills[gap.skillId] || original;
      const diff = simulated - original;
      
      // Calculate isolated impact by running the calc with only this skill changed
      const isolatedSkills = { ...analysis.gaps.reduce((acc: any, g: any) => ({ ...acc, [g.skillId]: g.currentProficiency }), {}), [gap.skillId]: simulated };
      const isolatedReadiness = calculateReadiness(isolatedSkills);
      const impact = isolatedReadiness - currentReadiness;

      return {
        ...gap,
        simulated,
        diff,
        impact
      };
    }).filter((gap: any) => gap.diff > 0).sort((a: any, b: any) => b.impact - a.impact);
  }, [simulatedSkills, analysis, currentReadiness]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-sage/30 p-8 text-center">
        <Target className="text-sage mb-4" size={48} />
        <h3 className="text-xl font-bold text-forest mb-2">No Target Role Set</h3>
        <p className="text-muted mb-6">You need to set a target role and complete an assessment to use the simulator.</p>
        <button onClick={() => navigate('/career')} className="bg-forest text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-forest-dark transition-all">
          Set Target Role
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-forest font-bold text-sm mb-4">
          <Activity size={16} />
          ESTIMATED SIMULATION
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-forest tracking-tight">What-if Career Simulator</h1>
        <p className="text-muted mt-2 text-lg">Simulate hypothetical skill improvements to see how they impact your career readiness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-sage/30 shadow-sm">
            <h2 className="text-xl font-bold text-forest mb-6 flex items-center gap-2">
              <Zap className="text-gold" /> Select skills to improve
            </h2>
            
            <div className="space-y-8">
              {analysis.gaps.map((gap: any) => (
                <div key={gap.skillId} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-ink">{gap.skillName}</h3>
                      <p className="text-sm text-muted">Required: {gap.requiredProficiency}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-sage uppercase tracking-widest block mb-1">Simulated Level</span>
                      <span className={`text-2xl font-black ${simulatedSkills[gap.skillId] > gap.currentProficiency ? 'text-forest' : 'text-ink'}`}>
                        {simulatedSkills[gap.skillId]}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative pt-2 pb-6">
                    <input 
                      type="range" 
                      min={gap.currentProficiency} 
                      max="100" 
                      value={simulatedSkills[gap.skillId]}
                      onChange={(e) => handleSkillChange(gap.skillId, parseInt(e.target.value))}
                      className="w-full h-2 bg-sage/20 rounded-lg appearance-none cursor-pointer accent-forest"
                    />
                    <div className="absolute left-0 -bottom-1 text-xs font-semibold text-muted">Current: {gap.currentProficiency}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Readiness Output */}
        <div className="space-y-6">
          <div className="bg-forest text-cream p-8 rounded-3xl border border-forest-dark shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 text-white/5">
              <Target size={150} />
            </div>
            
            <h2 className="text-lg font-bold text-sage mb-6">Readiness Impact</h2>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-cream/80">Current Readiness</span>
              <span className="text-xl font-bold">{currentReadiness}%</span>
            </div>
            
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-cream/20">
              <span className="font-bold text-white">Simulated Readiness</span>
              <span className="text-3xl font-black text-gold">{simulatedReadiness}%</span>
            </div>
            
            <motion.div 
              key={readinessChange}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${readinessChange > 0 ? 'bg-gold text-forest' : 'bg-white/10 text-white'}`}
            >
              <ArrowUpCircle size={18} className={readinessChange === 0 ? 'hidden' : ''} />
              Potential Change: +{readinessChange}%
            </motion.div>
          </div>

          {skillImpacts.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-sage/30 shadow-sm">
              <h3 className="font-bold text-forest mb-4 text-sm uppercase tracking-widest">Contributing Skills</h3>
              <div className="space-y-3">
                {skillImpacts.map((impact: any) => (
                  <div key={impact.skillId} className="flex justify-between items-center p-3 bg-sage/10 rounded-xl">
                    <span className="font-semibold text-ink text-sm">{impact.skillName}</span>
                    <span className="font-bold text-forest text-sm">+{impact.impact}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => navigate('/learning')}
            className="w-full bg-white border-2 border-forest text-forest hover:bg-forest hover:text-white px-6 py-4 rounded-2xl font-bold shadow-sm transition-all flex justify-between items-center group"
          >
            Apply to Learning Plan
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
