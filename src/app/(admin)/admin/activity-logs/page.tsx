'use client';

import React, { useState, useEffect } from 'react';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/activity-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\./g, ':');
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'warning': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const q = filter.toLowerCase();
    return (
      log.title.toLowerCase().includes(q) || 
      log.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#4B3832] tracking-tight">Log Aktivitas Kasir</h1>
          <p className="text-sm font-medium text-[#8B7355] mt-1">
            Pantau semua rekam jejak aktivitas kasir (10 hari terakhir).
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari aktivitas..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-white border border-[#DCC7AA] rounded-full pl-12 pr-4 py-2.5 font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#DCC7AA] overflow-hidden flex-1 flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-[#8B7355]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4B3832] mx-auto mb-4"></div>
            <p className="font-bold">Memuat data log aktivitas...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-[#8B7355]">
            <div className="w-20 h-20 bg-[#FFFDF7] border border-[#DCC7AA] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#6F4E37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="font-bold">Belum ada aktivitas kasir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF7] border-b border-[#DCC7AA]">
                  <th className="px-6 py-4 text-xs font-black text-[#6F4E37] uppercase tracking-wider w-48">Waktu</th>
                  <th className="px-6 py-4 text-xs font-black text-[#6F4E37] uppercase tracking-wider">Aktivitas</th>
                  <th className="px-6 py-4 text-xs font-black text-[#6F4E37] uppercase tracking-wider w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCC7AA]/30">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-[#F5E6CA]/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-[#8B7355] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#4B3832] mb-1">{log.title}</p>
                      <p className="text-xs font-medium text-[#6F4E37]">{log.message}</p>
                      {log.metadata && (
                        <pre className="mt-2 text-[10px] text-[#8B7355] bg-[#F5E6CA]/50 p-2 rounded-lg border border-[#DCC7AA]/50 overflow-x-auto max-w-2xl hidden md:block">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${getBadgeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
