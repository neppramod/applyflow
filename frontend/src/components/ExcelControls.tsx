import React, { useRef } from 'react';
import { jobService } from '../api';
import { Download, Upload, RefreshCw } from 'lucide-react';

interface ExcelProps { onRefresh: () => void; }

export default function ExcelControls({ onRefresh }: ExcelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const summary = await jobService.importPipelineFile(e.target.files[0]);
      alert(`Success! Imported: ${summary.successCount} new rows. Skipped: ${summary.skippedDuplicates} duplicates.`);
      onRefresh();
    } catch (err) {
      alert("Error processing Excel spreadsheet file parsing framework.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Bulk Data Core Data Pipeline</div>
      <div className="flex items-center gap-2">
        <button onClick={() => jobService.exportPipelineData()} className="inline-flex items-center gap-1.5 text-xs font-bold border rounded-xl px-3 py-2 text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={14}/> Export CSV
        </button>
        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-3 py-2 transition-colors shadow-sm">
          <Upload size={14}/> Import CSV
        </button>
      </div>
    </div>
  );
}
