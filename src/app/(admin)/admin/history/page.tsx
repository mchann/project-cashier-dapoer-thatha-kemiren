'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types/pos';

export default function AdminOrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all'|'paid'|'void'|'reservation'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk expandable table row
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    revenueToday: 0,
    transactionsCount: 0,
    pendingCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [txRes, statsRes] = await Promise.all([
        fetch('/api/pos/transactions'),
        fetch('/api/admin/dashboard')
      ]);
      
      if (txRes.ok) {
        const txData = await txRes.json();
        setCompletedOrders(txData);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setDashboardStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.invoiceNumber || '').toLowerCase().includes(q);
    
    // Filter Tanggal
    let matchDate = true;
    if (dateFilter) {
      // o.createdAt bisa berupa string ISO dari Mongoose
      const orderDate = new Date(o.createdAt || '').toLocaleDateString('en-CA'); // format YYYY-MM-DD
      matchDate = orderDate === dateFilter; 
    }

    // Filter Tipe (Lunas, Batal, Reservasi)
    let matchType = true;
    if (typeFilter === 'paid') matchType = o.paymentStatus === 'paid' && o.orderType !== 'reservation';
    else if (typeFilter === 'void') matchType = o.paymentStatus === 'void';
    else if (typeFilter === 'reservation') matchType = o.orderType === 'reservation';

    return matchText && matchDate && matchType;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter]);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7]">
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="w-full space-y-6 max-w-7xl mx-auto">
          
          {/* Judul & Breadcrumb */}
          <div className="flex items-center gap-4 border-b border-[#DCC7AA]/40 pb-4">
             <div className="bg-[#4B3832] w-12 h-12 flex items-center justify-center rounded-2xl text-[#FFFDF7] shadow-sm">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
             </div>
             <div>
               <h1 className="text-2xl font-black text-[#4B3832] tracking-tight">Riwayat Transaksi</h1>
               <p className="text-sm font-bold text-[#6F4E37]">Daftar pesanan (Lunas & Batal)</p>
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
                 <p className="text-xl font-black text-[#4B3832] leading-tight">{formatRupiah(dashboardStats.revenueToday)}</p>
               </div>
            </div>

            <div className="bg-white border border-[#DCC7AA]/70 rounded-2xl p-5 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
               </div>
               <div>
                 <p className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-1">Total Transaksi</p>
                 <p className="text-xl font-black text-[#4B3832] leading-tight">{dashboardStats.transactionsCount} <span className="text-sm font-bold text-[#6F4E37]">Nota</span></p>
               </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#DCC7AA]/70 shadow-sm flex flex-col gap-4 mb-6">
            {/* Filter Tipe (Segmented Control) */}
            <div className="flex w-full overflow-x-auto scrollbar-hide gap-1 bg-gray-100 p-1 rounded-xl shadow-inner shrink-0">
              <button 
                onClick={() => setTypeFilter('all')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-black transition-all whitespace-nowrap ${typeFilter === 'all' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Semua Tipe
              </button>
              <button 
                onClick={() => setTypeFilter('paid')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-black transition-all whitespace-nowrap ${typeFilter === 'paid' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Selesai (Lunas)
              </button>
              <button 
                onClick={() => setTypeFilter('void')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-black transition-all whitespace-nowrap ${typeFilter === 'void' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Dibatalkan (Void)
              </button>
              <button 
                onClick={() => setTypeFilter('reservation')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-black transition-all whitespace-nowrap ${typeFilter === 'reservation' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Reservasi
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
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
                <input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl px-4 py-2 font-bold text-sm text-[#4B3832] focus:border-[#4B3832] outline-none transition-all flex-1 md:w-48"
                />
              </div>
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div className="bg-white border border-[#DCC7AA]/70 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B3832]"></div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#FFFDF7] text-xs uppercase font-black text-[#6F4E37] border-b border-[#DCC7AA]">
                    <tr>
                      <th className="px-5 py-4 text-center w-12">#</th>
                      <th className="px-5 py-4">No. Struk</th>
                      <th className="px-5 py-4">Tanggal & Waktu</th>
                      <th className="px-5 py-4 text-center">Meja</th>
                      <th className="px-5 py-4">Nama Tamu</th>
                      <th className="px-5 py-4 text-right">Total Bayar</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCC7AA]/40 text-sm font-medium text-[#4B3832]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-[#8B7355]">
                             <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <p className="font-bold text-base">Tidak ada transaksi ditemukan.</p>
                            <p className="text-xs mt-1">Coba sesuaikan kata kunci atau filter tanggal Anda.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order, index) => {
                        return (
                          <React.Fragment key={order._id}>
                            <tr className="hover:bg-[#FFFDF7] transition-colors border-b border-[#DCC7AA]/20">
                              <td className="px-5 py-4 text-center border-r border-[#DCC7AA]/20 text-[#6F4E37] font-bold">
                                {index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}
                              </td>
                              <td className="px-5 py-4 font-bold text-[#6F4E37] whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span>{order.invoiceNumber}</span>
                                  {order.paymentStatus === 'void' && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded border border-red-200">VOID</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-4 whitespace-nowrap">{new Date(order.createdAt || '').toLocaleString('id-ID')}</td>
                              <td className="px-5 py-4 text-center">
                                <span className="bg-[#4B3832] text-[#FFFDF7] px-2.5 py-1 rounded-md font-black text-xs">
                                  {order.tableNumber || 'TA'}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-bold">{order.customerName}</td>
                              <td className="px-5 py-4 text-right">
                                <span className="font-black text-base">{formatRupiah(order.grandTotal)}</span>
                              </td>
                              <td className="px-5 py-4 text-center">
                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-2 rounded-full bg-[#DCC7AA]/30 text-[#6F4E37] hover:bg-[#4B3832] hover:text-[#FFFDF7] transition-colors"
                                  title="Lihat Detail"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                </button>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    )}
                  
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 bg-white border-t border-[#DCC7AA]/40">
                <p className="text-sm font-bold text-[#6F4E37]">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} dari {filteredOrders.length} nota
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#DCC7AA] rounded-xl text-sm font-bold text-[#4B3832] disabled:opacity-50 hover:bg-[#F5E6CA] transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#DCC7AA] rounded-xl text-sm font-bold text-[#4B3832] disabled:opacity-50 hover:bg-[#F5E6CA] transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      
        {/* Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#FFFDF7] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-[#DCC7AA]/50 bg-white">
                <div>
                  <h3 className="text-xl font-black text-[#4B3832]">Detail Transaksi {selectedOrder.invoiceNumber}</h3>
                  <p className="text-sm font-bold text-[#8B7355] mt-1">{new Date(selectedOrder.createdAt || '').toLocaleString('id-ID')}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-[#4B3832] bg-[#F5E6CA] hover:bg-[#DCC7AA] rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col lg:flex-row gap-6">
                
                <div className="flex-1 space-y-4">
                  <h4 className="text-sm font-bold text-[#6F4E37] uppercase tracking-wider border-b border-[#DCC7AA]/40 pb-2">Rincian Menu Asli</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-white border border-[#DCC7AA]/60 p-3 rounded-xl flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#4B3832] text-[#FFFDF7] rounded-md flex items-center justify-center text-xs font-bold shrink-0">{item.quantity}x</span>
                          <span className="font-bold text-[#4B3832] text-sm">{item.name}</span>
                        </div>
                        <span className="font-black text-[#6F4E37] text-sm">{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.voidedItems && selectedOrder.voidedItems.length > 0 && (
                    <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-4">
                      <h4 className="text-sm font-black text-red-700 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        Riwayat Item Dibatalkan / Dikurangi
                      </h4>
                      <div className="space-y-2">
                        {selectedOrder.voidedItems.map((vItem, idx) => (
                          <div key={idx} className="bg-white border-2 border-red-200 p-3 rounded-xl flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-red-600 text-white rounded-md flex items-center justify-center text-xs font-black shrink-0">-{vItem.quantity}x</span>
                              <div>
                                <p className="font-bold text-red-900 text-sm">{vItem.name}</p>
                                <p className="text-xs text-red-500 font-bold">{new Date(vItem.date).toLocaleTimeString('id-ID')}</p>
                              </div>
                            </div>
                            <span className="font-black text-red-700 text-sm line-through opacity-70">{formatRupiah(vItem.price * vItem.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:w-1/3 bg-[#F5E6CA]/50 p-5 rounded-2xl border border-[#DCC7AA]/50 h-fit space-y-3">
                  <h4 className="text-sm font-bold text-[#6F4E37] uppercase tracking-wider border-b border-[#DCC7AA]/40 pb-2">Pembayaran</h4>
                  <div className="flex justify-between text-sm"><span className="text-[#8B7355] font-bold">Subtotal</span><span className="text-[#4B3832] font-black">{formatRupiah(selectedOrder.subtotal)}</span></div>
                  {selectedOrder.dpAmount > 0 && <div className="flex justify-between text-sm"><span className="text-amber-600 font-bold">Uang Muka (DP)</span><span className="text-amber-700 font-black">-{formatRupiah(selectedOrder.dpAmount)}</span></div>}
                  {selectedOrder.guideCommission > 0 && <div className="flex justify-between text-sm"><span className="text-[#6F4E37] font-bold">Potongan Travel/Guide</span><span className="text-[#6F4E37] font-black">-{formatRupiah(selectedOrder.guideCommission)}</span></div>}
                  <div className="pt-3 border-t border-[#DCC7AA]/40 flex justify-between"><span className="text-[#4B3832] font-black text-base">TOTAL DIBAYAR</span><span className="text-[#4B3832] font-black text-xl">{formatRupiah(selectedOrder.grandTotal)}</span></div>
                  <div className="pt-4">
                    {selectedOrder.paymentStatus === 'void' ? (
                      <span className="w-full block text-center bg-red-100 text-red-700 font-black text-xs uppercase tracking-wider py-2 rounded-lg border border-red-200">Status: BATAL / VOID</span>
                    ) : (
                      <span className="w-full block text-center bg-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-wider py-2 rounded-lg border border-emerald-200">Status: {selectedOrder.paymentStatus === 'paid' ? 'LUNAS' : selectedOrder.paymentStatus}</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
