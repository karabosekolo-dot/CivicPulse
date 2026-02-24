
import React, { useState } from 'react';
import { CivicIssue, IssueStatus, UrgencyLevel } from '../types';
import { Share2, Check, ArrowUp } from 'lucide-react';

interface IssueCardProps {
  issue: CivicIssue;
  onClick: (issue: CivicIssue) => void;
  onVote: (id: string) => void;
}

const statusColors = {
  [IssueStatus.OPEN]: 'bg-yellow-100 text-yellow-800',
  [IssueStatus.INVESTIGATING]: 'bg-blue-100 text-blue-800',
  [IssueStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800',
  [IssueStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [IssueStatus.CLOSED]: 'bg-slate-100 text-slate-800',
};

const urgencyColors = {
  [UrgencyLevel.LOW]: 'text-green-600',
  [UrgencyLevel.MEDIUM]: 'text-yellow-600',
  [UrgencyLevel.HIGH]: 'text-orange-600',
  [UrgencyLevel.CRITICAL]: 'text-red-600 font-bold',
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, onVote }) => {
  const [copied, setCopied] = useState(false);
  
  const displayMedia = issue.imageUrl 
    ? { url: issue.imageUrl, type: 'image' } 
    : (issue.media && issue.media.length > 0 ? issue.media[0] : null);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: `CivicPulse: ${issue.title}`,
      text: `Check out this community issue: ${issue.description}`,
      url: window.location.href, // In a real app, this would include the issue ID in the route
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group"
      onClick={() => onClick(issue)}
    >
      {displayMedia && (
        <div className="h-48 overflow-hidden relative">
          {displayMedia.type === 'image' ? (
            <img src={displayMedia.url} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full relative">
              <video src={displayMedia.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                  <ArrowUp className="h-6 w-6 text-white rotate-90" /> {/* Using ArrowUp as a play icon placeholder or just Video icon */}
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3">
             <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColors[issue.status]}`}>
              {issue.status}
            </span>
          </div>
          {issue.media && issue.media.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold">
              +{issue.media.length - 1} more
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        {!displayMedia && (
          <div className="mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[issue.status]}`}>
              {issue.status}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{issue.title}</h3>
          <span className={`text-xs uppercase tracking-wider ${urgencyColors[issue.urgency]}`}>
            {issue.urgency}
          </span>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
          {issue.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">{new Date(issue.timestamp).toLocaleDateString()}</span>
            <span className="text-xs font-medium text-slate-600">{issue.category}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 relative ${copied ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100'}`}
              onClick={handleShare}
              title={copied ? "Link Copied!" : "Share report"}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Share'}</span>
              {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
                  Link copied to clipboard!
                </span>
              )}
            </button>

            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
              onClick={(e) => {
                e.stopPropagation();
                onVote(issue.id);
              }}
              title="Upvote report"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span className="font-bold">{issue.upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
