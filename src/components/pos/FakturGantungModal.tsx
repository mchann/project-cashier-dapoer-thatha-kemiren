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

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="faktur-gantung-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
    >
      <div className="bg-white rounded-2xl border-4 border-slate-400 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="bg-[#451a03] text-white px-6 py-4 border-b-2 border-[#d97706] flex items-center justify-between">
          <div>
            <h2 id="faktur-gantung-title" className="text-2xl font-black text-[#fefce8]">
              ANTREAN FAKTUR GANTUNG
            </h2>
            <p className="text-sm text-[#fde68a]">
              Pilih nomor meja pelanggan yang ingin memproses pelunasan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#78350f] hover:bg-[#451a03] text-white font-bold rounded-lg border border-[#f59e0b] cursor-pointer transition-colors"
          >
            Tutup [Esc]
          </button>
        </div>

        {/* Input Cari */}
        <div className="p-4 bg-[#fefce8] border-b-2 border-[#d6d3d1]">
          <label htmlFor="search-faktur" className="block text-sm font-extrabold text-[#451a03] mb-1">
            Cari Nomor Meja, Nama Tamu, atau No. Struk:
          </label>
          <input
            id="search-faktur"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik No. Meja (contoh: 07) atau Nama..."
            className="w-full bg-white border-2 border-[#a8a29e] rounded-xl px-4 py-3 font-bold text-lg text-[#291404] focus:border-[#d97706]"
          />
        </div>

        {/* Daftar Faktur Gantung */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-bold text-lg">
              Tidak ditemukan faktur gantung yang aktif.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
              return (
                <div
                  key={order._id}
                  className="bg-white border-2 border-[#d6d3d1] rounded-xl p-4 shadow-sm hover:border-[#78350f] hover:bg-[#fffbeb] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Info Kiri: Meja & Pelanggan */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#78350f] text-white px-3 py-1 rounded-lg font-black text-lg border border-[#451a03]">
                        Meja {order.tableNumber || 'TA'}
                      </span>
                      <span className="font-extrabold text-lg text-[#291404]">
                        {order.customerName}
                      </span>
                      <span className="text-xs font-bold text-[#57300a] uppercase px-2 py-0.5 bg-[#fefce8] rounded border border-[#d6d3d1]">
                        {order.orderType === 'qr_order'
                          ? 'QR Mandiri'
                          : order.orderType === 'reservation'
                          ? 'Reservasi Online'
                          : 'Dine-In Kasir'}
                      </span>
                      {order.paymentStatus === 'dp_paid' && (
                        <span className="bg-[#fefce8] text-[#78350f] font-extrabold text-xs px-2 py-0.5 rounded border border-[#d97706]">
                          DP 50% Dibayar ({formatRupiah(order.dpAmount)})
                        </span>
                      )}
                    </div>

                    {/* Indikator SMART MERGE */}
                    {order.isSmartMerged && (
                      <div className="inline-flex items-center gap-1.5 bg-[#fef08a] text-[#713f12] font-black text-xs px-3 py-1 rounded-lg border-2 border-[#facc15]">
                        <span>⚡ SMART MERGE: 2 pesanan QR digabung jadi 1 tagihan</span>
                      </div>
                    )}

                    <p className="text-sm text-[#57300a]">
                      <strong>No. Struk:</strong> {order.invoiceNumber} •{' '}
                      <strong>Jumlah Menu:</strong> {totalQty} item •{' '}
                      <strong>Waktu:</strong> {order.createdAt}
                    </p>
                  </div>

                  {/* Kanan: Harga & Tombol Pilih */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#e7e5e4]">
                    <div className="text-right">
                      <span className="block text-xs font-extrabold text-[#57300a]">
                        TOTAL TAGIHAN:
                      </span>
                      <span className="text-2xl font-black text-[#78350f]">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="bg-[#78350f] hover:bg-[#451a03] text-white font-extrabold px-5 py-2.5 rounded-xl border-2 border-[#d97706] shadow-sm cursor-pointer transition-colors"
                    >
                      Pilih & Pelunasan →
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
