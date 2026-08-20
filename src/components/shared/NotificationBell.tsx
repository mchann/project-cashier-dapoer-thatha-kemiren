'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ActivityLog {
  _id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  role: 'admin' | 'staff';
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/logs?role=${role}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    };

    fetchLogs();
    // Poll every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const unreadCount = logs.filter(l => !l.isRead).length;

  const handleMarkAsRead = async () => {
    try {
      const res = await fetch('/api/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        fetchLogs(); // refresh
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getIconColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-emerald-500 bg-emerald-100';
      case 'danger': return 'text-red-500 bg-red-100';
      case 'warning': return 'text-amber-500 bg-amber-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#4B3832] hover:bg-[#F5E6CA] rounded-full transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-20 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white border border-[#DCC7AA] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
          <div className="flex justify-between items-center p-4 border-b border-[#DCC7AA]/50 bg-[#FFFDF7]">
            <h3 className="font-bold text-[#4B3832]">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAsRead}
                className="text-[10px] text-[#6F4E37] font-bold hover:underline"
              >
                Tandai Dibaca
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
            {logs.length === 0 ? (
              <p className="text-center text-sm text-[#8B7355] py-6">Belum ada notifikasi.</p>
            ) : (
              <ul className="space-y-1">
                {logs.map(log => (
                  <li key={log._id} className={`p-3 rounded-xl flex gap-3 ${!log.isRead ? 'bg-[#F5E6CA]/30' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${getIconColor(log.type)}`}>
                      {log.type === 'danger' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      {log.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      {log.type === 'warning' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                      {log.type === 'info' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    </div>
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-[#4B3832]">{log.title}</h4>
                        <span className="text-[9px] font-bold text-[#8B7355] shrink-0 whitespace-nowrap">{formatTime(log.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-[#6F4E37] mt-0.5 leading-relaxed">{log.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
