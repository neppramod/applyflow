import React from 'react';
import { Job } from '../types';
import { Trash2, Calendar, Briefcase, ExternalLink, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  onStatusChange: (id: number, status: Job['status']) => void;
  onDeleteJob: (id: number) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function JobList({ jobs, onStatusChange, onDeleteJob, totalPages, currentPage, onPageChange }: JobListProps) {
  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-white border rounded-2xl">No applications match your current query.</p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-start justify-between gap-4 transition-all hover:shadow-md">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-lg tracking-tight">{job.company}</h3>
                
                {/* Clickable LinkedIn Anchor Link */}
                {job.link && (
                  <a 
                    href={job.link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md font-medium transition-colors"
                  >
                    LinkedIn <ExternalLink size={12} />
                  </a>
                )}

                <span className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ml-auto sm:ml-0 ${
                  job.status === 'OFFER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  job.status === 'INTERVIEWING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  job.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {job.status}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Briefcase size={14} className="text-gray-400" /> {job.role}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium flex-wrap">
                <span className="flex items-center gap-1"><Calendar size={13}/> Added {job.appliedDate}</span>
                
                {/* Dynamic location tag layout block */}
                {job.location && (
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                    <MapPin size={13} className="text-slate-400" /> {job.location}
                  </span>
                )}
              </div>

              {job.description && (
                <p className="text-sm text-gray-500 bg-slate-50/70 p-3 rounded-xl border border-slate-100 mt-2 text-justify line-clamp-3 hover:line-clamp-none transition-all duration-300">
                  {job.description}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-4 min-w-[100px]">
              <select
                value={job.status}
                onChange={(e) => onStatusChange(job.id, e.target.value as Job['status'])}
                className="text-xs font-semibold border border-gray-200 rounded-xl p-2 bg-slate-50 cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="APPLIED">APPLIED</option>
                <option value="INTERVIEWING">INTERVIEWING</option>
                <option value="OFFER">OFFER</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <button
                onClick={() => onDeleteJob(job.id)}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Remove Pipeline Entry"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Pagination Footer Elements controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-6">
          <p className="text-xs text-gray-500 font-medium">Page {currentPage + 1} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
