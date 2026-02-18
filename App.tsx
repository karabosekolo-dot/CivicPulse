
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CivicIssue, 
  IssueStatus, 
  IssueCategory, 
  UrgencyLevel,
  IssueUpdate
} from './types';
import { IssueCard } from './components/IssueCard';
import { ReportingForm } from './components/ReportingForm';
import { IssueDetails } from './components/IssueDetails';
import { Button } from './components/Button';

const INITIAL_ISSUES: CivicIssue[] = [
  {
    id: '1',
    title: 'Major Pothole on Market St',
    description: 'Extremely deep pothole that is causing cars to swerve into oncoming traffic. Multiple near-accidents witnessed today.',
    category: IssueCategory.INFRASTRUCTURE,
    status: IssueStatus.IN_PROGRESS,
    urgency: UrgencyLevel.CRITICAL,
    location: { lat: 37.7749, lng: -122.4194, address: '245 Market Street' },
    imageUrl: 'https://picsum.photos/seed/pothole/600/400',
    reporterName: 'John Doe',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    upvotes: 42,
    updates: [
      {
        id: 'u1',
        status: IssueStatus.INVESTIGATING,
        comment: 'City engineer has visited the site to assess damage.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        author: 'Admin'
      }
    ]
  },
  {
    id: '2',
    title: 'Water Main Leak',
    description: 'Clean water is gushing out of a sidewalk crack near the primary school. Thousands of gallons being wasted.',
    category: IssueCategory.WATER_UTILITIES,
    status: IssueStatus.OPEN,
    urgency: UrgencyLevel.HIGH,
    location: { lat: 37.7833, lng: -122.4167, address: 'Park & 4th intersection' },
    imageUrl: 'https://picsum.photos/seed/leak/600/400',
    reporterName: 'Sarah Smith',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    upvotes: 128,
    updates: []
  },
  {
    id: '3',
    title: 'Street Lighting Failure',
    description: 'The entire block of residential streetlights is out. Very dark and feels unsafe at night.',
    category: IssueCategory.SAFETY_SECURITY,
    status: IssueStatus.RESOLVED,
    urgency: UrgencyLevel.MEDIUM,
    location: { lat: 37.7739, lng: -122.4312, address: 'Willow Lane' },
    imageUrl: 'https://picsum.photos/seed/darkness/600/400',
    reporterName: 'Resident Association',
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
    upvotes: 15,
    updates: [
      {
        id: 'u2',
        status: IssueStatus.RESOLVED,
        comment: 'Faulty circuit breaker replaced. All lights functional.',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        author: 'Utility Team'
      }
    ]
  }
];

const App: React.FC = () => {
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);
  const [isReporting, setIsReporting] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [filter, setFilter] = useState<IssueCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedIssue = useMemo(() => 
    issues.find(i => i.id === selectedIssueId) || null
  , [issues, selectedIssueId]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesFilter = filter === 'All' || issue.category === filter;
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [issues, filter, searchTerm]);

  const handleReportSubmit = (data: any) => {
    const newIssue: CivicIssue = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      status: IssueStatus.OPEN,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      updates: []
    };
    setIssues([newIssue, ...issues]);
    setIsReporting(false);
  };

  const handleAddUpdate = (issueId: string, updateData: Omit<IssueUpdate, 'id' | 'timestamp' | 'author'>) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const newUpdate: IssueUpdate = {
          id: `u-${Date.now()}`,
          timestamp: new Date().toISOString(),
          author: 'Citizen Follow-up',
          ...updateData
        };
        return {
          ...issue,
          status: updateData.status,
          updates: [...issue.updates, newUpdate]
        };
      }
      return issue;
    }));
  };

  const handleVote = (id: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { ...issue, upvotes: issue.upvotes + 1 } : issue
    ));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">CivicPulse</h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold">Community Voice Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-full max-w-md mx-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search issues in your neighborhood..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button variant="primary" onClick={() => setIsReporting(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report Issue
          </Button>
        </div>
      </header>

      {/* Hero / Dashboard Stats */}
      <section className="bg-indigo-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
            <p className="text-4xl font-black mb-1">{issues.length}</p>
            <p className="text-indigo-200 text-sm font-medium uppercase">Active Reports</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
            <p className="text-4xl font-black mb-1">{issues.filter(i => i.status === IssueStatus.RESOLVED).length}</p>
            <p className="text-indigo-200 text-sm font-medium uppercase">Resolved This Month</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl">
            <p className="text-4xl font-black mb-1">2.4h</p>
            <p className="text-indigo-200 text-sm font-medium uppercase">Avg. Response Time</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter by Category
              </h3>
              <div className="space-y-2">
                <button 
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'All' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                  onClick={() => setFilter('All')}
                >
                  All Issues
                </button>
                {Object.values(IssueCategory).map(cat => (
                  <button 
                    key={cat}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === cat ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">Transparency Report</h4>
              <p className="text-xs text-slate-600 mb-4">Our platform ensures all reports are public and trackable. This promotes government accountability.</p>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[72%]"></div>
              </div>
              <p className="text-[10px] mt-2 font-bold text-slate-500 uppercase">72% Resolution Rate</p>
            </div>
          </aside>

          {/* Issue Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {filter === 'All' ? 'Community Feed' : filter}
              </h2>
              <span className="text-sm text-slate-500 font-medium">Showing {filteredIssues.length} reports</span>
            </div>

            {filteredIssues.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredIssues.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    onClick={(i) => setSelectedIssueId(i.id)}
                    onVote={handleVote}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">No issues found</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">Try changing your filters or be the first to report an issue in this category.</p>
                <Button variant="outline" className="mt-6" onClick={() => setFilter('All')}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale opacity-60">
            <div className="bg-slate-600 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <span className="font-black text-slate-600">CivicPulse</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 Community Transparency Initiative. Empowering citizens through data.</p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isReporting && (
        <ReportingForm 
          onSubmit={handleReportSubmit} 
          onCancel={() => setIsReporting(false)} 
        />
      )}
      {selectedIssue && (
        <IssueDetails 
          issue={selectedIssue} 
          onClose={() => setSelectedIssueId(null)} 
          onAddUpdate={handleAddUpdate}
        />
      )}
    </div>
  );
};

export default App;
