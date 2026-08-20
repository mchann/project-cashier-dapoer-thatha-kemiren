// src/app/(admin)/admin/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Data Dummy untuk presentasi
const DUMMY_RECENT_TRANSACTIONS = [
  { id: 'INV-001', table: '04', name: 'Bpk. Ahmad', total: 150000, time: '14:30', status: 'Lunas' },
  { id: 'INV-002', table: '12', name: 'Ibu Dina', total: 85000, time: '14:15', status: 'Lunas' },
  { id: 'INV-003', table: '07', name: 'Keluarga Budi', total: 325000, time: '13:50', status: 'Lunas' },
  { id: 'INV-004', table: 'TA', name: 'GrabFood (Sandi)', total: 45000, time: '13:45', status: 'Lunas' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenueToday: 0,
    transactionsCount: 0,
    activeProductsCount: 0,
    pendingCount: 0,
    recentTransactions: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };
    fetchStats();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* 1. Header Area */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-[#4B3832] tracking-tight">Dashboard</h1>
        <p className="text-sm font-bold text-[#6F4E37]">
          Ringkasan performa dan aktivitas Dapoer Thatha hari ini.
        </p>
      </div>

      {/* 2. Stat Cards Grid (4 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Utama / Solid */}
        <div className="bg-[#4B3832] p-6 rounded-[2rem] shadow-md border border-[#4B3832] flex flex-col justify-between relative overflow-hidden group">
           <div className="flex justify-between items-start mb-4 relative z-10">
             <span className="text-[#FFFDF7] font-bold text-sm">Penjualan Hari Ini</span>
             <div className="w-8 h-8 rounded-full bg-[#FFFDF7]/10 flex items-center justify-center text-[#FFFDF7]">
               <svg className="w-4 h-4 transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </div>
           </div>
           <div className="relative z-10">
             <h3 className="text-3xl font-black text-[#FFFDF7] tracking-tight mb-2">{formatRupiah(stats.revenueToday)}</h3>
             <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Penjualan Harian
             </span>
           </div>
           {/* Abstract Decoration */}
           <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#FFFDF7]/5 rounded-full pointer-events-none"></div>
        </div>

        {/* Card 2: Terang */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#DCC7AA]/60 flex flex-col justify-between group hover:border-[#4B3832]/30 transition-colors">
           <div className="flex justify-between items-start mb-4">
             <span className="text-[#6F4E37] font-bold text-sm">Total Transaksi</span>
             <div className="w-8 h-8 rounded-full border border-[#DCC7AA] flex items-center justify-center text-[#4B3832]">
               <svg className="w-4 h-4 transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </div>
           </div>
           <div>
             <h3 className="text-4xl font-black text-[#4B3832] tracking-tight mb-2">{stats.transactionsCount}</h3>
             <span className="text-[#8B7355] text-[10px] font-bold uppercase tracking-wider">Nota Lunas Hari Ini</span>
           </div>
        </div>

        {/* Card 3: Terang */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#DCC7AA]/60 flex flex-col justify-between group hover:border-[#4B3832]/30 transition-colors">
           <div className="flex justify-between items-start mb-4">
             <span className="text-[#6F4E37] font-bold text-sm">Total Menu</span>
             <div className="w-8 h-8 rounded-full border border-[#DCC7AA] flex items-center justify-center text-[#4B3832]">
               <svg className="w-4 h-4 transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
             </div>
           </div>
           <div>
             <h3 className="text-4xl font-black text-[#4B3832] tracking-tight mb-2">{stats.activeProductsCount}</h3>
             <span className="text-[#8B7355] text-[10px] font-bold uppercase tracking-wider">Item Aktif Dijual</span>
           </div>
        </div>

        {/* Card 4: Terang (Alert) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#DCC7AA]/60 flex flex-col justify-between group hover:border-amber-500/50 transition-colors relative overflow-hidden">
           <div className="flex justify-between items-start mb-4 relative z-10">
             <span className="text-[#6F4E37] font-bold text-sm">Faktur Gantung</span>
             <div className="w-8 h-8 rounded-full border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </div>
           </div>
           <div className="relative z-10">
             <h3 className="text-4xl font-black text-[#4B3832] tracking-tight mb-2">{stats.pendingCount}</h3>
             <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
               <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
               Menunggu Pembayaran
             </span>
           </div>
        </div>
      </div>

      {/* 3. Kolom Konten Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri (2 Span): Grafik Penjualan */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-[#DCC7AA]/60 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-[#4B3832] text-lg">Statistik Penjualan</h3>
            <span className="bg-[#F5E6CA] text-[#6F4E37] px-3 py-1 rounded-full text-xs font-bold">7 Hari Terakhir</span>
          </div>

          {/* Dummy Bar Chart CSS */}
          <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 h-48 mt-auto px-2 md:px-6">
            {[40, 60, 30, 85, 75, 50, 95].map((height, idx) => (
              <div key={idx} className="w-full max-w-[40px] flex flex-col items-center gap-3">
                <div className="w-full bg-[#F5E6CA] rounded-full h-full relative overflow-hidden flex items-end justify-center">
                  <div 
                    className="w-full bg-[#4B3832] rounded-full transition-all duration-1000 ease-out" 
                    style={{ height: `${height}%` }}
                  >
                     {/* Label Persentase di dalam bar (Desktop) */}
                     {height > 50 && (
                       <span className="hidden md:block text-center mt-2 text-[#FFFDF7] text-[10px] font-bold">{height}%</span>
                     )}
                  </div>
                </div>
                <span className="text-[#8B7355] font-bold text-xs">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan (1 Span): Aktivitas Kasir Terbaru */}
        <div className="bg-[#4B3832] rounded-[2rem] p-6 shadow-sm border border-[#4B3832] text-[#FFFDF7] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg">Aktivitas Kasir</h3>
            <span className="text-[#DCC7AA] text-xs font-bold border border-[#DCC7AA]/30 px-2 py-1 rounded-lg">Real-time</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[320px]">
            <ul className="space-y-4">
              {stats.recentTransactions.length === 0 ? (
                <li className="p-3 text-center text-[#DCC7AA] text-sm italic">
                  Belum ada transaksi hari ini.
                </li>
              ) : (
                stats.recentTransactions.map((trx: any) => (
                  <li key={trx._id} className="flex gap-4 p-3 bg-[#FFFDF7]/5 hover:bg-[#FFFDF7]/10 rounded-2xl transition-colors border border-[#FFFDF7]/10">
                    <div className="w-10 h-10 rounded-full bg-[#FFFDF7] text-[#4B3832] flex items-center justify-center font-black shrink-0">
                      {trx.tableNumber || 'TA'}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-bold text-sm truncate">{trx.customerName}</h4>
                      <p className="text-[#DCC7AA] text-[10px] font-bold">
                        {trx.invoiceNumber} • {new Date(trx.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block font-black text-sm text-emerald-400">{formatRupiah(trx.grandTotal)}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          <button className="w-full mt-4 py-3 bg-[#FFFDF7] text-[#4B3832] hover:bg-[#F5E6CA] rounded-xl font-black text-sm transition-colors">
            Lihat Semua Transaksi
          </button>
        </div>
      </div>

    </div>
  );
}
