'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

interface TutupTokoModalProps {
  onClose: () => void;
  cashierName: string;
}

export function TutupTokoModal({ onClose, cashierName }: TutupTokoModalProps) {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/pos/daily-summary');
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleTutupToko = async () => {
    setIsClosing(true);
    try {
      // Kirim log ke admin
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Laporan Tutup Toko',
          message: `Kasir ${cashierName} telah menutup toko hari ini. Total Pendapatan: Rp ${summary?.totalIncome?.toLocaleString('id-ID')} (${summary?.successfulOrders} Sukses, ${summary?.cancelledOrders} Batal).`,
          type: 'info',
          targetRole: 'admin',
        })
      });
      
      // Logout
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error(error);
      setIsClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#FFFDF7] border border-[#DCC7AA] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#4B3832] px-6 py-5 flex flex-col items-center justify-center text-center relative">
          <button 
            onClick={onClose} 
            disabled={isClosing}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="w-16 h-16 bg-[#FFFDF7] rounded-full flex items-center justify-center mb-3 text-[#4B3832]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </div>
          <h2 className="text-xl font-black text-[#FFFDF7] tracking-tight">Tutup Toko</h2>
          <p className="text-sm text-[#F5E6CA] font-medium mt-1">Rekapitulasi Shift Hari Ini</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B3832]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#F5E6CA]/30 border border-[#DCC7AA] rounded-2xl p-4 flex flex-col items-center text-center">
                <span className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-1">Total Pendapatan</span>
                <span className="text-3xl font-black text-[#4B3832]">Rp {summary?.totalIncome?.toLocaleString('id-ID') || 0}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Pesanan Sukses</span>
                  <span className="text-2xl font-black text-emerald-600">{summary?.successfulOrders || 0}</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Pesanan Batal</span>
                  <span className="text-2xl font-black text-red-600">{summary?.cancelledOrders || 0}</span>
                </div>
              </div>

              <div className="mt-6 text-center px-4">
                <p className="text-sm font-bold text-[#6F4E37] italic">
                  "Kerja luar biasa hari ini, {cashierName}! Silakan beristirahat dan sampai jumpa besok."
                </p>
              </div>

              <button
                onClick={handleTutupToko}
                disabled={isClosing}
                className="mt-6 w-full py-4 bg-[#ef4444] hover:bg-red-600 disabled:bg-red-300 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isClosing ? 'Memproses...' : 'Akhiri Shift & Keluar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
