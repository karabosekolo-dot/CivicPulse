
import React, { useState, useRef } from 'react';
import { IssueStatus, IssueUpdate, MediaItem } from '../types';
import { Button } from './Button';
import { X, Plus, Video } from 'lucide-react';

interface FollowUpFormProps {
  issueId: string;
  initialStatus: IssueStatus;
  onClose: () => void;
  onSubmit: (update: Omit<IssueUpdate, 'id' | 'timestamp' | 'author'>) => void;
}

export const FollowUpForm: React.FC<FollowUpFormProps> = ({ issueId, initialStatus, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<IssueStatus>(initialStatus);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmit({ 
      comment, 
      status, 
      imageUrl: mediaItems.find(m => m.type === 'image')?.url,
      media: mediaItems 
    });
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
            <div className="grid grid-cols-3 gap-3 mb-3">
              {mediaItems.map((item, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  {item.type === 'image' ? (
                    <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={item.url} className="w-full h-full object-cover" />
                  )}
                  <button 
                    type="button"
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
              {mediaItems.length < 3 && (
                <button 
                  type="button"
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
