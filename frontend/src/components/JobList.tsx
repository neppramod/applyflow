import React, { useState } from 'react';
import { Job } from '../types';
import { Trash2, Calendar, Briefcase, ExternalLink, MapPin, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  onStatusChange: (id: number, status: Job['status']) => void;
  onDeleteJob: (id: number) => void;
  onUpdateJob: (id: number, updatedFields: Omit<Job, 'id' | 'status' | 'appliedDate'>) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function JobList({ jobs, onStatusChange, onDeleteJob, onUpdateJob, totalPages, currentPage, onPageChange }: JobListProps) {
  // Store the ID of the job currently being actively edited
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Local temporary form states for clean inline updates
  const [editCompany, setEditCompany] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const startEditing = (job: Job) => {
    setEditingId(job.id);
    setEditCompany(job.company);
    setEditRole(job.role);
    setEditLocation(job.location || '');
    setEditLink(job.link || '');
    setEditDescription(job.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSave = (id: number) => {
    if (!editCompany.trim() || !editRole.trim()) return;
    onUpdateJob(id, {
      company: editCompany.trim(),
      role: editRole.trim(),
      location: editLocation.trim() || "",
      link: editLink.trim() || "",
      description: editDescription.trim() || ""
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center py-12 bg-white border rounded-2xl shadow-sm font-medium">
          No applications match your current query.
        </p>
      ) : (
        jobs.map((job) => (
          <div key={job.id} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm transition-all hover:shadow-md">
            {editingId === job.id ? (
              /* =======================================================
                 1. EDIT MODE: Renders input fields ONLY when modifying code
                 ======================================================= */
              <div className="space-y-3 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company</label>
                    <input type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-sm font-bold bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role Title</label>
                    <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-sm font-semibold bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</label>
                    <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Link</label>
                    <input type="url" value={editLink} onChange={(e) => setEditLink(e.target.value)} className="w-full p-2 border border-gray-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Details / Notes</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm h-24 bg-slate-50 resize-none focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <button onClick={cancelEditing} className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl px-3 py-1.5 transition-colors">
                    <X size={14}/> Cancel
                  </button>
                  <button onClick={() => handleSave(job.id)} className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-1.5 transition-colors shadow-sm">
                    <Check size={14}/> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* =======================================================
                 2. RENDER MODE: Clean, structural dashboard text layout
                 ======================================================= */
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg tracking-tight">{job.company}</h3>
                    
                    {job.link && (
                      <a href={job.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md font-medium transition-colors">
                        LinkedIn <ExternalLink size={12} />
                      </a>
                    )}

                    <span className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${
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
                    {job.location && (
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                        <MapPin size={13} className="text-slate-400" /> {job.location}
                      </span>
                    )}
                  </div>

                  {/* FIXED DESCRIPTION CONTAINER BOX AREA */}
                  {job.description && (
                    <p className="text-sm text-gray-600 bg-slate-50/80 p-3.5 rounded-xl border border-gray-100 mt-3 text-justify leading-relaxed whitespace-pre-wrap">
                      {job.description}
                    </p>
                  )}
                </div>

                {/* Right Actions Dropdowns Column */}
                <div className="flex flex-col items-end gap-3 min-w-[110px]">
                  <select
                    value={job.status}
                    onChange={(e) => onStatusChange(job.id, e.target.value as Job['status'])}
                    className="text-xs font-bold border border-gray-200 rounded-xl p-2 bg-slate-50 cursor-pointer focus:ring-2 focus:ring-blue-500/20 w-full"
                  >
                    <option value="APPLIED">APPLIED</option>
                    <option value="INTERVIEWING">INTERVIEWING</option>
                    <option value="OFFER">OFFER</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditing(job)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Entry">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => onDeleteJob(job.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Remove Entry">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Paginated Footer Controls Toggles */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-6">
          <p className="text-xs text-gray-500 font-semibold tracking-wide">Page {currentPage + 1} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange(currentPage - 1)} 
              disabled={currentPage === 0} 
              className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage >= totalPages - 1} 
              className="p-1.5 border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}