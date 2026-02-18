
import React, { useState, useRef } from 'react';
import { IssueCategory, GeoLocation, AnalysisResult } from '../types';
import { Button } from './Button';
import { analyzeIssue } from '../services/geminiService';

interface ReportingFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ReportingForm: React.FC<ReportingFormProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: "Current Location Detected"
        });
      },
      () => alert("Unable to retrieve your location")
    );
  };

  const handleNext = async () => {
    if (step === 1 && !description) return;
    
    if (step === 2) {
      setIsAnalyzing(true);
      try {
        const result = await analyzeIssue(description, image || undefined);
        setAnalysis(result);
        setStep(3);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleFinalSubmit = () => {
    onSubmit({
      title: title || analysis?.summary || description.substring(0, 30) + "...",
      description,
      imageUrl: image,
      location: location || { lat: 0, lng: 0, address: "Manual Entry" },
      category: analysis?.category || IssueCategory.OTHER,
      urgency: analysis?.urgency || 'Medium',
      reporterName: "Guest Citizen",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Report Community Issue</h2>
          <button onClick={onCancel} className="p-1 hover:bg-indigo-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <label className="block text-sm font-bold text-slate-700 mb-2">What is the problem?</label>
              <textarea 
                className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Describe the issue in detail (e.g., 'Broken streetlight on 5th Ave', 'Water pipe leaking near school...')"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">Add Photo Evidence (Optional)</label>
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {image ? (
                    <img src={image} alt="Preview" className="h-32 mx-auto rounded-lg object-cover" />
                  ) : (
                    <div className="flex flex-col items-center py-4 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Click to upload or take a photo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-bold mb-4">Location Details</h3>
              <p className="text-sm text-slate-600 mb-6">Accurate location helps local authorities find and fix the problem faster.</p>
              
              <Button 
                variant="outline" 
                className="w-full py-4 flex items-center gap-2 mb-4"
                onClick={detectLocation}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {location ? 'Location Captured ✓' : 'Use Current GPS Location'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or enter manually</span>
                </div>
              </div>

              <input 
                type="text" 
                className="mt-4 w-full p-3 border border-slate-300 rounded-xl outline-none" 
                placeholder="Street address or landmark"
                value={location?.address || ''}
                onChange={(e) => setLocation({ lat: 0, lng: 0, address: e.target.value })}
              />
            </div>
          )}

          {step === 3 && analysis && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-indigo-800">AI Analysis Complete</span>
                </div>
                <p className="text-sm text-indigo-700">{analysis.summary}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Proposed Title</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none"
                    value={title || analysis.summary.substring(0, 40) + "..."}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                    <div className="p-3 bg-slate-100 rounded-xl text-sm font-medium">{analysis.category}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Urgency</label>
                    <div className={`p-3 rounded-xl text-sm font-bold ${analysis.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {analysis.urgency}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          {step > 1 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step < 3 ? (
            <Button 
              className="flex-1" 
              isLoading={isAnalyzing} 
              onClick={handleNext}
              disabled={step === 1 && !description}
            >
              Continue
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleFinalSubmit}>Submit Report</Button>
          )}
        </div>
      </div>
    </div>
  );
};
