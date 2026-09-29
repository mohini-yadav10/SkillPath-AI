import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResumeAnalysis() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setResult(res.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error parsing resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Resume NLP Extraction</h1>
        <p className="text-gray-500">Upload your PDF resume to automatically populate your skill profile.</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Drag & drop your resume</h3>
          <p className="text-sm text-gray-500 mb-4">or click to browse (PDF only, max 5MB)</p>
          
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />
          <label 
            htmlFor="resume-upload"
            className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50"
          >
            Select PDF File
          </label>
        </div>

        {file && (
          <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-500" size={24} />
              <span className="font-medium text-blue-900">{file.name}</span>
            </div>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Analyzing...' : 'Extract Skills'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded border border-red-200 flex items-start gap-2">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded text-green-800">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle size={18} /> Analysis Complete
              </div>
              <p className="text-sm">{result.message}</p>
            </div>

            <div>
              <h3 className="text-md font-bold text-gray-800 mb-3">Extracted Skills</h3>
              {result.extractedSkills.length === 0 ? (
                <p className="text-gray-500 italic">No exact skill matches found. Try adding skills manually in your profile.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result.extractedSkills.map((skill: any, idx: number) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {skill.name}
                      <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                        Unverified
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded text-sm text-gray-600">
              <span className="font-bold">Note:</span> We do not blindly trust extracted skills. These have been added to your profile with a "Resume" source tag and a 50% confidence score. You must verify them via adaptive assessments to increase your Career Readiness Score.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
