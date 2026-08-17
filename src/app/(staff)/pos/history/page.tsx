// src/app/(staff)/pos/history/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { POSHeader } from '@/components/pos/POSHeader';
import { POSSidebar } from '@/components/pos/POSSidebar';
import { PrinterSettingsModal } from '@/components/pos/PrinterSettingsModal';
import { DUMMY_FAKTUR_GANTUNG } from '@/lib/dummy-pos-data';

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // State untuk layout kasir (Burger Menu & Printer Modal)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);

  // State untuk expandable table row
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Ambil hanya pesanan yang sudah lunas
  const completedOrders = useMemo(() => DUMMY_FAKTUR_GANTUNG.filter((o) => o.paymentStatus === 'paid'), []);
  const pendingOrders = useMemo(() => DUMMY_FAKTUR_GANTUNG.filter((o) => o.paymentStatus !== 'paid'), []);

  // Hitung Statistik Hari Ini
  const todayRevenue = completedOrders.reduce((acc, order) => acc + order.grandTotal, 0);
  const todayTransactionsCount = completedOrders.length;
  
  // Format tanggal saat ini (misal: 17 Agustus 2026)
  const todayDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const filteredOrders = completedOrders.filter((o) => {
    // Pencarian Teks
    const q = searchQuery.toLowerCase();
    const matchText = 
      (o.tableNumber || '').toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.invoiceNumber.toLowerCase().includes(q);
    
    // Filter Tanggal
    // (Dalam simulasi ini kita cek apakah string tanggal memuat format dari dateFilter)
    // Di dunia nyata: o.createdAt harusnya Date object dan difilter sesuai DD/MM/YYYY
    // Karena dummy pakai "03 Agu 2026", kita anggap aja true jika belum di-set
    let matchDate = true;
    if (dateFilter) {
      // Dummy check, selalu tampil karena format string berbeda dengan YYYY-MM-DD input date
      // Idealnya: parse dateFilter dan parse o.createdAt
      matchDate = true; 
    }

    return matchText && matchDate;
  });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FFFDF7]">
      {/* Sidebar Navigation */}
      <POSSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenPrinter={() => setIsPrinterModalOpen(true)}
      />

      {/* Header Utama Kasir */}
      <POSHeader
        cashierName="Siti (Kasir 01)"
        openOrdersCount={pendingOrders.length}
        totalOrders={todayTransactionsCount}
        totalRevenue={todayRevenue}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenFakturGantung={() => {}} // Sengaja dikosongkan karena di halaman riwayat
      />

      {/* Printer Settings Modal */}
      <PrinterSettingsModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
      />

      {/* Area Konten Utama Halaman Riwayat */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Judul & Breadcrumb */}
          <div className="flex items-center gap-4 border-b border-[#DCC7AA]/40 pb-4">
             <div className="bg-[#4B3832] w-12 h-12 flex items-center justify-center rounded-2xl text-[#FFFDF7] shadow-sm">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
             </div>
             <div>
               <h1 className="text-2xl font-black text-[#4B3832] tracking-tight">Riwayat Transaksi</h1>
               <p className="text-sm font-bold text-[#6F4E37]">Daftar pesanan yang telah diselesaikan (Lunas)</p>
             </div>
          </div>

          {/* Kartu Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DCC7AA]/70 rounded-2xl p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
               <div>
                 <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Tanggal</p>
                 <p className="text-sm font-black text-[#4B3832] leading-tight">{todayDateFormatted}</p>
               </div>
            </div>

            <div className="bg-white border border-[#DCC7AA]/70 rounded-2xl p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               </div>
               <div>
                 <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Pendapatan Lunas</p>
                 <p className="text-xl font-black text-[#4B3832] leading-tight">{formatRupiah(todayRevenue)}</p>
               </div>
            </div>

            <div className="bg-white border border-[#DCC7AA]/70 rounded-2xl p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
               </div>
               <div>
                 <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Total Transaksi</p>
                 <p className="text-xl font-black text-[#4B3832] leading-tight">{todayTransactionsCount} <span className="text-sm font-bold text-[#6F4E37]">Nota</span></p>
               </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#DCC7AA]/70 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Input Pencarian */}
            <div className="relative w-full md:w-1/2">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F4E37]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. Meja, Nama Tamu, atau No. Struk..."
                className="w-full bg-[#FFFDF7] border border-[#DCC7AA] rounded-full pl-11 pr-4 py-2.5 font-bold text-sm text-[#4B3832] focus:border-[#4B3832] outline-none transition-all"
              />
            </div>
            
            {/* Input Filter Tanggal */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="date-filter" className="text-xs font-bold text-[#6F4E37] whitespace-nowrap">Filter Tanggal:</label>
              <input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl px-4 py-2 font-bold text-sm text-[#4B3832] focus:border-[#4B3832] outline-none transition-all flex-1 md:w-48"
              />
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div className="bg-white border border-[#DCC7AA]/70 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#4B3832] text-[#FFFDF7]">
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider w-12 text-center">#</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider">No. Struk</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider">Tanggal & Waktu</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-center">Meja</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider">Nama Tamu</th>
                    <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-right">Total Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCC7AA]/40 text-sm font-medium text-[#4B3832]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-[#8B7355]">
                           <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <p className="font-bold text-base">Tidak ada transaksi ditemukan.</p>
                          <p className="text-xs mt-1">Coba sesuaikan kata kunci atau filter tanggal Anda.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => {
                      const isExpanded = expandedRowId === order._id;
                      const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);

                      return (
                        <React.Fragment key={order._id}>
                          <tr 
                            onClick={() => toggleRow(order._id)}
                            className={`cursor-pointer transition-colors ${isExpanded ? 'bg-[#F5E6CA]/30' : 'hover:bg-[#FFFDF7]'}`}
                          >
                            <td className="px-5 py-4 text-center border-r border-[#DCC7AA]/20">
                              <button className={`p-1 rounded-full transition-colors ${isExpanded ? 'bg-[#4B3832] text-white' : 'bg-[#DCC7AA]/30 text-[#6F4E37] hover:bg-[#DCC7AA]/60'}`}>
                                <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </button>
                            </td>
                            <td className="px-5 py-4 font-bold text-[#6F4E37] whitespace-nowrap">{order.invoiceNumber}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{order.createdAt}</td>
                            <td className="px-5 py-4 text-center">
                              <span className="bg-[#4B3832] text-[#FFFDF7] px-2.5 py-1 rounded-md font-black text-xs">
                                {order.tableNumber || 'TA'}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-bold">{order.customerName}</td>
                            <td className="px-5 py-4 text-right">
                              <span className="font-black text-base">{formatRupiah(order.grandTotal)}</span>
                            </td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {isExpanded && (
                            <tr className="bg-[#FFFDF7] border-b-2 border-[#DCC7AA]">
                              <td colSpan={6} className="px-0 py-0">
                                <div className="p-6 border-l-4 border-[#4B3832]">
                                  <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Left: Summary */}
                                    <div className="lg:w-1/3 bg-[#F5E6CA]/50 p-4 rounded-2xl border border-[#DCC7AA]/50 space-y-3">
                                      <h4 className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider border-b border-[#DCC7AA]/40 pb-2">Informasi Pembayaran</h4>
                                      
                                      <div className="flex justify-between text-sm">
                                        <span className="text-[#8B7355] font-bold">Subtotal</span>
                                        <span className="text-[#4B3832] font-black">{formatRupiah(order.subtotal)}</span>
                                      </div>
                                      
                                      {order.dpAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-amber-600 font-bold">Uang Muka (DP)</span>
                                          <span className="text-amber-700 font-black">-{formatRupiah(order.dpAmount)}</span>
                                        </div>
                                      )}

                                      {order.guideCommission > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-[#6F4E37] font-bold">Potongan Travel/Guide</span>
                                          <span className="text-[#6F4E37] font-black">-{formatRupiah(order.guideCommission)}</span>
                                        </div>
                                      )}
                                      
                                      <div className="pt-2 border-t border-[#DCC7AA]/40 flex justify-between">
                                        <span className="text-[#4B3832] font-black text-base">TOTAL DIBAYAR</span>
                                        <span className="text-[#4B3832] font-black text-lg">{formatRupiah(order.grandTotal)}</span>
                                      </div>
                                      
                                      <div className="pt-2">
                                        <span className="inline-block bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-emerald-200">
                                          Status: LUNAS
                                        </span>
                                      </div>
                                    </div>

                                    {/* Right: Items */}
                                    <div className="lg:w-2/3">
                                      <h4 className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-3">Rincian Menu ({totalQty} Item)</h4>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="bg-white border border-[#DCC7AA]/60 p-3 rounded-xl flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                              <span className="w-6 h-6 bg-[#4B3832] text-[#FFFDF7] rounded-md flex items-center justify-center text-xs font-bold shrink-0">
                                                {item.quantity}x
                                              </span>
                                              <span className="font-bold text-[#4B3832] truncate text-sm">
                                                {item.name}
                                              </span>
                                            </div>
                                            <span className="font-black text-[#6F4E37] text-sm shrink-0 pl-3">
                                              {formatRupiah(item.price * item.quantity)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
