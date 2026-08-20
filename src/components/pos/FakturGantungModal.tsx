// src/components/pos/FakturGantungModal.tsx
'use client';

import React, { useState } from 'react';
import { Order } from '@/types/pos';

interface FakturGantungModalProps {
  isOpen: boolean;
  orders: Order[];
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export function FakturGantungModal({
  isOpen,
  orders,
  onClose,
  onSelectOrder,
}: FakturGantungModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      (o.tableNumber || '').toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.invoiceNumber.toLowerCase().includes(q)
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
      aria-labelledby="faktur-gantung-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm p-4 md:p-6"
    >
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#DCC7AA]">
        
        {/* Header Modal */}
        <div className="bg-[#4B3832] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 id="faktur-gantung-title" className="text-xl font-black text-[#FFFDF7] tracking-wide">
              Antrean Faktur Gantung
            </h2>
            <p className="text-xs text-[#DCC7AA] mt-1 font-medium">
              Pilih meja / pelanggan yang ingin melakukan pelunasan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-transparent hover:bg-[#FFFDF7]/20 text-[#FFFDF7] rounded-full transition-colors"
            title="Tutup Modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F4E37]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              id="search-faktur"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. Meja, Nama Tamu, atau Struk..."
              className="w-full bg-transparent border border-[#DCC7AA] rounded-full pl-11 pr-4 py-3 font-bold text-sm text-[#4B3832] focus:border-[#4B3832] outline-none transition-all"
            />
          </div>
        </div>

        {/* Daftar Faktur Gantung */}
        <div className="p-6 pt-4 flex-1 overflow-y-auto custom-scrollbar space-y-4 min-h-0">
          {filteredOrders.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center text-[#8B7355]">
               <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="font-bold text-base">Tidak ada antrean faktur gantung.</p>
              <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian Anda.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
              return (
                <div
                  key={order._id}
                  className="bg-[#FFFDF7] border border-[#DCC7AA]/70 rounded-2xl p-5 hover:border-[#4B3832]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  {/* Info Kiri */}
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
                          ? 'Reservasi Online'
                          : 'Kasir'}
                      </span>
                      {order.paymentStatus === 'dp_paid' && (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-emerald-200">
                          DP {formatRupiah(order.dpAmount)}
                        </span>
                      )}
                    </div>

                    {order.isSmartMerged && (
                      <div className="inline-flex items-center gap-1.5 bg-[#fefce8] text-[#ca8a04] font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border border-[#fef08a]">
                        <span>⚡ SMART MERGE: Ada Penambahan Pesanan</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs font-medium text-[#8B7355]">
                      <span><strong className="text-[#6F4E37]">Struk:</strong> {order.invoiceNumber}</span>
                      <span><strong className="text-[#6F4E37]">Item:</strong> {totalQty}</span>
                      <span><strong className="text-[#6F4E37]">Waktu:</strong> {formatDateTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Kanan: Harga & Tombol */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-[#DCC7AA]/30 shrink-0">
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#8B7355] mb-0.5">
                        Total Tagihan
                      </span>
                      <span className="text-xl font-black text-[#4B3832]">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm transition-transform active:scale-[0.98] flex items-center gap-2"
                    >
                      Pilih & Lunas
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
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
