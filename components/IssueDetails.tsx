
import React, { useState, useMemo, useRef } from 'react';
import { CivicIssue, IssueStatus, IssueUpdate } from '../types';
import { Button } from './Button';
import { FollowUpForm } from './FollowUpForm';

interface IssueDetailsProps {
  issue: CivicIssue;
  onClose: () => void;
  onAddUpdate: (issueId: string, update: Omit<IssueUpdate, 'id' | 'timestamp' | 'author'>) => void;
}

const statusTheme = {
  [IssueStatus.OPEN]: {
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    ring: 'ring-amber-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4a1 1 0 01-.8 1.6H6a1 1 0 01-1-1V6z" clipRule="evenodd" />
      </svg>
    )
  },
  [IssueStatus.INVESTIGATING]: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    ring: 'ring-blue-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    )
  },
  [IssueStatus.IN_PROGRESS]: {
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
    border: 'border-indigo-200',
    ring: 'ring-indigo-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  },
  [IssueStatus.RESOLVED]: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  [IssueStatus.CLOSED]: {
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    ring: 'ring-slate-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    )
  }
};

export const IssueDetails: React.FC<IssueDetailsProps> = ({ issue, onClose, onAddUpdate }) => {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
  const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Oldest');
  
  // Quick Snap State
  const [quickPhoto, setQuickPhoto] = useState<string | null>(null);
  const [quickComment, setQuickComment] = useState('');
  const [isQuickSnapping, setIsQuickSnapping] = useState(false);
  const quickFileInputRef = useRef<HTMLInputElement>(null);

  const filteredAndSortedUpdates = useMemo(() => {
    let updates = [...issue.updates];

    if (statusFilter !== 'All') {
      updates = updates.filter(u => u.status === statusFilter);
    }

    updates.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'Oldest' ? timeA - timeB : timeB - timeA;
    });

    return updates;
  }, [issue.updates, statusFilter, sortOrder]);

  const handleQuickSnap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQuickPhoto(reader.result as string);
        setIsQuickSnapping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitQuickUpdate = () => {
    if (!quickPhoto) return;
    onAddUpdate(issue.id, {
      comment: quickComment || "Photo evidence added.",
      status: issue.status,
      imageUrl: quickPhoto
    });
    setQuickPhoto(null);
    setQuickComment('');
    setIsQuickSnapping(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `CivicPulse: ${issue.title}`,
      text: `Tracking this community issue on CivicPulse: ${issue.description}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-y-auto flex flex-col animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white z-10 p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Issue Details</h2>
            <button 
              onClick={handleShare}
              className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-slate-50 transition-all"
              title="Share Issue"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
              {issue.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusTheme[issue.status].bg} ${statusTheme[issue.status].color}`}>
              {issue.status}
            </span>
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wide border border-red-100">
              {issue.urgency} Urgency
            </span>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{issue.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-slate-600 whitespace-pre-wrap mb-6 text-sm leading-relaxed font-medium">
                {issue.description}
              </p>
              <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Reporter</span>
                  <span className="font-black text-slate-900">{issue.reporterName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Reported On</span>
                  <span className="font-black text-slate-900">{new Date(issue.timestamp).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-tighter">Location</span>
                  <span className="font-black text-indigo-600 truncate max-w-[160px]">{issue.location.address || 'Detected Location'}</span>
                </div>
              </div>
            </div>
            
            {issue.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white p-1">
                <img src={issue.imageUrl} alt="Initial Evidence" className="w-full h-full object-cover max-h-[300px] rounded-xl" />
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 pt-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Activity Timeline</h3>
                <button 
                  onClick={() => setShowFollowUp(true)}
                  className="p-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm hover:scale-110 active:scale-95"
                  title="Add timeline update"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                  <select 
                    className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as IssueStatus | 'All')}
                  >
                    <option value="All">All activity</option>
                    {Object.values(IssueStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order:</span>
                  <select 
                    className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'Newest' | 'Oldest')}
                  >
                    <option value="Oldest">Oldest</option>
                    <option value="Newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="relative pl-2">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 rounded-full"></div>
              
              <div className="space-y-10 relative">
                {/* Initial Report Event */}
                {(statusFilter === 'All' || statusFilter === IssueStatus.OPEN) && sortOrder === 'Oldest' && (
                  <div className="flex gap-6 group">
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform ring-4 ring-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-slate-900 tracking-tight">Original Citizen Report</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(issue.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">Public entry registered by {issue.reporterName}.</p>
                    </div>
                  </div>
                )}
                
                {filteredAndSortedUpdates.map((update) => {
                  const theme = statusTheme[update.status];
                  return (
                    <div key={update.id} className="flex gap-6 group">
                      <div className="relative z-10">
                        <div className={`w-10 h-10 ${theme.bg} ${theme.color} rounded-2xl flex items-center justify-center shadow-md border ${theme.border} group-hover:scale-110 transition-transform ring-4 ring-white`}>
                          {theme.icon}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${theme.bg} ${theme.color}`}>
                              {update.status}
                            </span>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Update by {update.author}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(update.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group-hover:border-slate-200">
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">{update.comment}</p>
                          {update.imageUrl && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 shadow-sm max-w-sm cursor-zoom-in group/img transition-transform hover:scale-[1.02]">
                              <img src={update.imageUrl} alt="Update evidence" className="w-full h-auto" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Final Reverse Entry for Newest Order */}
                {(statusFilter === 'All' || statusFilter === IssueStatus.OPEN) && sortOrder === 'Newest' && (
                  <div className="flex gap-6 group">
                    <div className="relative z-10">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-4 ring-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-slate-900 tracking-tight">Original Citizen Report</p>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(issue.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium italic">Initial report submission.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {filteredAndSortedUpdates.length === 0 && statusFilter !== 'All' && (
              <div className="py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 mt-6">
                <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-slate-500 font-bold">No updates for this status yet.</p>
                <button 
                  onClick={() => setStatusFilter('All')}
                  className="text-xs text-indigo-600 font-black uppercase mt-3 tracking-widest hover:underline"
                >
                  See all activity
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md p-4 border-t border-slate-100 flex flex-wrap gap-3">
          <Button variant="outline" className="flex-1 min-w-[100px]" onClick={onClose}>Close</Button>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={quickFileInputRef}
            className="hidden"
            onChange={handleQuickSnap}
          />
          
          <Button 
            variant="secondary" 
            className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-900"
            onClick={() => quickFileInputRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            Snap Photo
          </Button>

          <Button variant="primary" className="flex-1 min-w-[160px] shadow-lg shadow-indigo-100" onClick={() => setShowFollowUp(true)}>
            Full Report
          </Button>
        </div>

        {/* Quick Snap Confirmation Modal */}
        {isQuickSnapping && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white font-black uppercase tracking-widest text-xs">
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Quick Evidence
                </span>
                <button onClick={() => setIsQuickSnapping(false)} className="hover:text-slate-300 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8">
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-inner group relative">
                  <img src={quickPhoto!} alt="Evidence captured" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[8px] px-2 py-1 rounded-full backdrop-blur-md">Live Capture Preview</div>
                </div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Observation Note</label>
                <input 
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all font-medium text-sm"
                  placeholder="What's happening in this photo?"
                  value={quickComment}
                  onChange={(e) => setQuickComment(e.target.value)}
                  autoFocus
                />
                <div className="mt-8 flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsQuickSnapping(false)}>Discard</Button>
                  <Button variant="primary" className="flex-1 rounded-xl shadow-lg shadow-indigo-100" onClick={submitQuickUpdate}>Confirm</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFollowUp && (
          <FollowUpForm 
            issueId={issue.id} 
            initialStatus={issue.status}
            onClose={() => setShowFollowUp(false)}
            onSubmit={(update) => {
              onAddUpdate(issue.id, update);
              setShowFollowUp(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
