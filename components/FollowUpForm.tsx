
import React, { useState, useRef } from 'react';
import { IssueStatus, IssueUpdate } from '../types';
import { Button } from './Button';

interface FollowUpFormProps {
  issueId: string;
  initialStatus: IssueStatus;
  onClose: () => void;
  onSubmit: (update: Omit<IssueUpdate, 'id' | 'timestamp' | 'author'>) => void;
}

export const FollowUpForm: React.FC<FollowUpFormProps> = ({ issueId, initialStatus, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<IssueStatus>(initialStatus);
  const [image, setImage] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({ comment, status, imageUrl: image || undefined });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-bold">Add Follow-up Report</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Update Observations</label>
            <textarea
              required
              className="w-full h-28 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all"
              placeholder="Provide a detailed update... (e.g., 'The repair crew is here', 'Condition has worsened due to rain')"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Visual Evidence (Optional)</label>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {image ? (
                <div className="relative group">
                  <img src={image} alt="Follow-up Evidence" className="h-36 mx-auto rounded-lg object-cover shadow-sm" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-slate-900/50 px-2 py-1 rounded">Change Photo</span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs font-medium">Click to snap or upload new evidence</span>
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Update Current Status</label>
            <select 
              className="w-full p-3 border border-slate-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
            >
              {Object.values(IssueStatus).map(s => (
                <option key={s} value={s}>{s === initialStatus ? `${s} (Current)` : s}</option>
              ))}
            </select>
            <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Updating the status will notify other community members and tracking systems.</p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={!comment.trim()}>Post Update</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
