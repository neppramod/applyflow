import React, { useState } from 'react';
import { Job } from '../types';
import { PlusCircle, Link2, MapPin } from 'lucide-react';

interface JobFormProps {
  onAddJob: (jobData: Omit<Job, 'id' | 'status' | 'appliedDate'>) => void;
  existingJobs: Job[];
}

export default function JobForm({ onAddJob, existingJobs }: JobFormProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [link, setLink] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Real-time calculation to find out how many applications exist for this exact company
  const internalCompanyMatches = existingJobs.filter(
    j => j.company.toLowerCase().trim() === company.toLowerCase().trim()
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    onAddJob({
      company: company.trim(),
      role: role.trim(),
      description: description.trim(),
      link: link.trim() || undefined,
      location: location.trim() || undefined
    });

    setCompany('');
    setRole('');
    setLink('');
    setLocation('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
        <PlusCircle size={18} className="text-blue-600" /> Log Application
      </h2>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Company</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
          placeholder="e.g. OpenAI"
          required
        />
        {company.trim() && internalCompanyMatches > 0 && (
          <p className="text-amber-600 text-xs font-semibold mt-1 animate-pulse">
            ⚠️ You already have {internalCompanyMatches} logged application(s) for this company!
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role Title</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
          placeholder="e.g. Full Stack Engineer"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Link2 size={12}/> LinkedIn Link</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
          placeholder="https://linkedin.com..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12}/> Location / Work Environment</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
          placeholder="e.g. Remote, Hybrid, New York, etc."
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Details / Notes</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500/20"
          placeholder="Paste requirements, stack, or timeline details here..."
        />
      </div>

      <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors">
        Submit Pipeline Entry
      </button>
    </form>
  );
}
