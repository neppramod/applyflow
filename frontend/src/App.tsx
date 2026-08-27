import React, { useState, useEffect, useMemo, useRef } from 'react';
import { jobService } from './api';
import { Job } from './types';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import Fuse from 'fuse.js';
import { Search, Layers, BarChart3, Download, Upload } from 'lucide-react';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [activeUser, setActiveUser] = useState(localStorage.getItem('applyflow_profile') || 'guest_user');
  
  // Pagination & Analytics State Variables
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [extendedStats, setExtendedStats] = useState<{companyCounts: any[], dailyCounts: any[]}>({companyCounts: [], dailyCounts: []});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    loadJobs(currentPage); 
    loadAnalyticsSummary();
  }, [currentPage]);

  const loadJobs = async (page: number) => {
    try {
      setIsLoading(true);
      const paginatedData = await jobService.getAllJobs(page, 10);
      setJobs(paginatedData.content || []);
      setTotalPages(paginatedData.totalPages || 1);
    } catch (error) {
      console.error("Failed to load pipeline datasets", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsSummary = async () => {
    try {
      const stats = await jobService.getExtendedAnalytics();
      setExtendedStats(stats);
    } catch (e) {
      console.error("Error reading analytics data", e);
    }
  };

  const handleProfileChange = (newProfile: string) => {
    localStorage.setItem('applyflow_profile', newProfile);
    setActiveUser(newProfile);
    setCurrentPage(0); // Reset page numbers for the new view layout context
  };

  const handleAddJob = async (newJobData: Omit<Job, 'id' | 'status' | 'appliedDate'>) => {
    try {
      await jobService.addJob(newJobData);
      setCurrentPage(0); 
      loadJobs(0);
      loadAnalyticsSummary();
    } catch (error) {
      console.error("Failed to save job", error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => { // 1. Changed type to string 
  try {
    // 2. Cast the incoming string explicitly as your strict Union Type choice
    const validatedStatus = newStatus as Job['status']; 
    
    await jobService.updateJobStatus(id, validatedStatus);
    loadJobs(currentPage);
    loadAnalyticsSummary();
  } catch (error) {
    console.error("Failed to update status", error);
  }
};

  const handleDeleteJob = async (id: number) => {
    try {
      await jobService.deleteJob(id);
      loadJobs(currentPage);
      loadAnalyticsSummary();
    } catch (error) {
      console.error("Failed to delete job", error);
    }
  };

  const handleUpdateJob = async (id: number, updatedFields: Omit<Job, 'id' | 'status' | 'appliedDate'>) => {
    try {
      await jobService.updateJob(id, updatedFields);
      loadJobs(currentPage);            // Refresh current paginated list table matching row layouts
      loadAnalyticsSummary();           // Dynamically re-trigger metrics calculation updates
    } catch (error) {
      console.error("Failed to update application changes", error);
    }
  };


  // Bulk Data Spreadsheet Handlers
  const handleExport = () => {
    window.open('/api/jobs/export', '_blank');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setIsLoading(true);
      const file = e.target.files[0];
      const report = await jobService.importPipelineFile(file);
      alert(`🎉 Import Complete!\n• New Rows Saved: ${report.successCount}\n• Duplicates Skipped: ${report.skippedDuplicates}`);
      setCurrentPage(0);
      loadJobs(0);
      loadAnalyticsSummary();
    } catch (err) {
      alert("Error parsing CSV data. Please check column format schema.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Client Fuzzy Matching Engine for Texts
  const fuse = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    return new Fuse(jobs, { 
      keys: ['company', 'role', 'description', 'location'], 
      threshold: 0.35 
    });
  }, [jobs]);

  // Unified Multi-Field Filter Router (Strict Date Checking + Fuzzy Text Checking)
  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return jobs;

    // Isolate date-based typing sequences (e.g. YYYY-MM-DD or YYYY-MM) natively
    const isDateQuery = /^\d{4}/.test(query);
    if (isDateQuery) {
      return jobs.filter(job => job.appliedDate.toLowerCase().includes(query));
    }

    // Default back to standard multi-field fuzzy matching for strings
    if (!fuse) return [];
    return fuse.search(query).map(res => res.item);
  }, [searchQuery, jobs, fuse]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dynamic Action Header Bar Layout */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><Layers size={22} /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ApplyFlow</h1>
              <p className="text-xs text-gray-500 font-medium">Personal Job Tracking Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 1. DYNAMIC USER PROFILE DROPDOWN SELECTOR BLOCK */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 mr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 pl-1.5">User:</span>
              <select
                value={activeUser}
                onChange={(e) => {
                  if (e.target.value === 'NEW_PROFILE') {
                    const name = prompt("Enter new profile username:");
                    if (name && name.trim()) handleProfileChange(name.trim());
                  } else {
                    handleProfileChange(e.target.value);
                  }
                }}
                className="text-xs font-bold bg-transparent text-gray-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="guest_user">guest_user</option>
                {activeUser !== 'guest_user' && <option value={activeUser}>{activeUser}</option>}
                <option value="NEW_PROFILE" className="text-blue-600 font-bold">+ Add Profile...</option>
              </select>
            </div>

            {/* 2. DYNAMIC PIPELINE TOTAL METRICS TRACKER BUTTON */}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold border border-blue-100 rounded-xl px-3 py-2 text-blue-700 bg-blue-50/50 shadow-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              Total: {jobs.length}
            </span>

            {/* 3. BULK SPREADSHEET EXPORT OPERATION ACTION BUTTON */}
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
            >
              <Download size={14}/> Export CSV
            </button>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button 
              onClick={handleImportClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-3 py-2 shadow-sm transition-all"
            >
              <Upload size={14}/> Import CSV
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Tracking Workspaces Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* STICKY SIDEBAR: Keeps both input form and graphs floating together on scroll */}
          <div className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
            <JobForm onAddJob={handleAddJob} existingJobs={jobs} />
            
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <BarChart3 size={16} className="text-blue-500"/> Volume By Day
              </h3>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
                {extendedStats.dailyCounts.length === 0 ? (
                  <p className="text-gray-400 italic">No logging records yet.</p>
                ) : (
                  extendedStats.dailyCounts.map((d: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-medium text-gray-600">{d.DATE}</span>
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">{d.COUNT} applied</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column Layout: Search Inputs + Live Tracking Ledgers */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search date (YYYY-MM), company, or type 'Remote' to filter..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-gray-400 text-sm animate-pulse">
                Syncing pipeline databases...
              </div>
            ) : (
              <JobList 
                jobs={filteredJobs} 
                onStatusChange={handleStatusChange} 
                onDeleteJob={handleDeleteJob}
                onUpdateJob={handleUpdateJob}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(p) => setCurrentPage(p)}
              />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}