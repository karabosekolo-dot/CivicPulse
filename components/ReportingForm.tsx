
import React, { useState, useRef } from 'react';
import { IssueCategory, GeoLocation, AnalysisResult, MediaItem, UrgencyLevel } from '../types';
import { Button } from './Button';
import { analyzeIssue } from '../services/geminiService';
import { useAuth } from '../services/authContext';
import { X, Image as ImageIcon, Video, Plus } from 'lucide-react';

interface ReportingFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ReportingForm: React.FC<ReportingFormProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualRefinement, setShowManualRefinement] = useState(false);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const type = file.type.startsWith('video/') ? 'video' : 'image';
          setMediaItems(prev => [...prev, { url: reader.result as string, type }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
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
    if (step === 2 && !location?.address) {
      setError("Please provide a location before continuing.");
      return;
    }
    
    setError(null);

    if (step === 2) {
      setIsAnalyzing(true);
      try {
        // Use the first image for analysis if available
        const firstImage = mediaItems.find(m => m.type === 'image')?.url;
        const result = await analyzeIssue(description, firstImage);
        setAnalysis(result);
        setStep(3);
      } catch (err) {
        console.error(err);
        setError("AI analysis failed, but you can still submit your report manually.");
        // Fallback analysis result so they can still proceed
        setAnalysis({
          category: IssueCategory.OTHER,
          urgency: UrgencyLevel.MEDIUM,
          summary: description.substring(0, 50) + "...",
          tags: [],
          recommendedAction: "Please wait for manual review by community moderators."
        });
        setStep(3);
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
      imageUrl: mediaItems.find(m => m.type === 'image')?.url,
      media: mediaItems,
      location: location || { lat: 0, lng: 0, address: "Manual Entry" },
      category: analysis?.category || IssueCategory.OTHER,
      urgency: analysis?.urgency || 'Medium',
      reporterName: user?.name || "Guest Citizen",
      recommendedAction: analysis?.recommendedAction
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

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
                <label className="block text-sm font-bold text-slate-700 mb-2">Media Evidence (Photos/Videos)</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {mediaItems.map((item, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                      {item.type === 'image' ? (
                        <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" />
                      )}
                      <button 
                        onClick={() => removeMedia(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Video className="h-6 w-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}
                  {mediaItems.length < 6 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all"
                    >
                      <Plus className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Add</span>
                    </button>
                  )}
                </div>
                <input 
                  type="file" 
                  multiple
                  accept="image/*,video/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <p className="text-[10px] text-slate-400 font-medium">Upload up to 6 photos or videos to provide context.</p>
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
                  <span className="bg-white px-2 text-slate-500">Or refine location</span>
                </div>
              </div>

              {!showManualRefinement && !location?.address ? (
                <button 
                  type="button"
                  onClick={() => setShowManualRefinement(true)}
                  className="mt-4 w-full py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Enter Specific Details (Cross-streets, Landmarks)
                </button>
              ) : (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Specific Location Details</label>
                  <textarea 
                    className="w-full p-3 border border-slate-300 rounded-xl outline-none text-sm h-24 focus:ring-2 focus:ring-indigo-500" 
                    placeholder="e.g., Near the intersection of 5th and Main, opposite the public library..."
                    value={location?.address || ''}
                    onChange={(e) => setLocation(prev => ({ ...(prev || { lat: 0, lng: 0 }), address: e.target.value }))}
                  />
                </div>
              )}
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
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">AI Recommended Action</label>
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 italic font-medium">
                    {analysis.recommendedAction}
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
              disabled={(step === 1 && !description) || (step === 2 && !location?.address)}
            >
              {isAnalyzing ? 'Analyzing Issue...' : 'Continue'}
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleFinalSubmit}>Submit Report</Button>
          )}
        </div>
      </div>
    </div>
  );
};
