
import React, { useState } from 'react';
import { CivicIssue, IssueStatus, UrgencyLevel } from '../types';

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
      {issue.imageUrl && (
        <div className="h-48 overflow-hidden relative">
          <img src={issue.imageUrl} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 right-3">
             <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColors[issue.status]}`}>
              {issue.status}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        {!issue.imageUrl && (
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
          
          <div className="flex items-center gap-1">
            <button 
              className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center relative ${copied ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'}`}
              onClick={handleShare}
              title={copied ? "Link Copied!" : "Share report"}
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
              {copied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">Copied!</span>}
            </button>

            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-indigo-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onVote(issue.id);
              }}
              title="Upvote report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="font-bold">{issue.upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
