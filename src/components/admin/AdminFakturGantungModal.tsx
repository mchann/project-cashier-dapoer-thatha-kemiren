'use client';

import React, { useState, useEffect } from 'react';

interface AdminFakturGantungModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminFakturGantungModal({ isOpen, onClose }: AdminFakturGantungModalProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/pos/transactions/pending')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      (o.tableNumber || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.invoiceNumber || '').toLowerCase().includes(q)
    );
  });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${time} WIB (${dateStr})`;
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm p-4 md:p-6"
    >
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#DCC7AA]">
        
        {/* Header Modal */}
        <div className="bg-[#4B3832] px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <h2 id="faktur-gantung-title" className="text-xl md:text-2xl font-black text-[#FFFDF7] tracking-tight">
              Daftar Faktur Gantung
            </h2>
            <p className="text-[#F5E6CA] text-sm mt-1 font-medium">
              Data transaksi pesanan yang belum dibayar lunas
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#FFFDF7]/70 hover:text-[#FFFDF7] hover:bg-[#FFFDF7]/10 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Pencarian */}
        <div className="p-4 border-b border-[#DCC7AA]/50 shrink-0 bg-white">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text"
              placeholder="Cari no meja, nama pelanggan, atau no struk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFDF7] border border-[#DCC7AA] rounded-full pl-12 pr-4 py-3 font-semibold text-[#4B3832] focus:border-[#4B3832] outline-none transition-all placeholder:text-[#8B7355]/60"
            />
          </div>
        </div>

        {/* Daftar List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#F5E6CA]/10">
          {isLoading ? (
            <div className="text-center py-10 font-bold text-[#8B7355]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B3832] mx-auto mb-4"></div>
              Memuat data...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-20 h-20 bg-white border border-[#DCC7AA] rounded-full flex items-center justify-center mb-4 text-[#8B7355]">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <p className="text-[#8B7355] font-bold">Tidak ada faktur gantung saat ini</p>
            </div>
          ) : (
            filteredOrders.map(order => {
              const totalQty = order.items.reduce((acc: number, cur: any) => acc + cur.quantity, 0);

              return (
                <div key={order._id} className="bg-white border border-[#DCC7AA] p-4 rounded-2xl mb-4 flex flex-col md:flex-row gap-4 items-start justify-between shadow-sm hover:border-[#4B3832] transition-colors">
                  {/* Kiri: Info */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="bg-[#4B3832] text-[#FFFDF7] px-3.5 py-1.5 rounded-lg font-black text-sm">
                        Meja {order.tableNumber || 'TA'}
                      </span>
                      <span className="font-extrabold text-lg text-[#4B3832] tracking-tight">
                        {order.customerName}
                      </span>
                      <span className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-wider px-2.5 py-1 bg-[#F5E6CA] rounded-md">
                        {order.orderType === 'qr_order'
                          ? 'QR Mandiri'
                          : order.orderType === 'reservation'
                          ? 'Reservasi'
                          : 'Kasir'}
                      </span>
                      {order.paymentStatus === 'dp_paid' && (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-emerald-200">
                          DP {formatRupiah(order.dpAmount)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-[#8B7355]">
                      <span><strong className="text-[#6F4E37]">Struk:</strong> {order.invoiceNumber}</span>
                      <span><strong className="text-[#6F4E37]">Item:</strong> {totalQty}</span>
                      <span><strong className="text-[#6F4E37]">Waktu:</strong> {formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Kanan: Harga */}
                  <div className="flex flex-col items-end justify-center shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-[#DCC7AA]/30 w-full md:w-auto">
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7355] mb-0.5">
                      Total Tagihan
                    </span>
                    <span className="text-xl font-black text-[#4B3832]">
                      {formatRupiah(order.grandTotal)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
