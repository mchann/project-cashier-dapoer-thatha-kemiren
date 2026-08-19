// src/components/pos/OrderCart.tsx
'use client';

import React, { useState } from 'react';
import { OrderItem, Partner } from '@/types/pos';
import { TravelPartnerSelector } from './TravelPartnerSelector';

interface OrderCartProps {
  orderType: 'dine_in' | 'takeaway';
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  paymentMode: 'pay_now' | 'save_faktur';
  dpAmount: number;
  guideCommission: number;
  partners: Partner[];
  isPartnerOrder: boolean;
  selectedPartnerId: string;
  onChangeOrderType: (type: 'dine_in' | 'takeaway') => void;
  onUpdateTableNumber: (val: string) => void;
  onUpdateCustomerName: (val: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onChangePaymentMode: (mode: 'pay_now' | 'save_faktur') => void;
  onTogglePartner: (checked: boolean) => void;
  onSelectPartner: (partnerId: string, partnerName: string) => void;
  onChangeCommission: (commission: number) => void;
  onSaveFakturGantung: () => void;
  onPayNow: () => void;
  onOpenVoidModal: () => void;
  onClearCart: () => void;
}

export function OrderCart({
  orderType,
  tableNumber,
  customerName,
  items,
  paymentMode,
  dpAmount,
  guideCommission,
  partners,
  isPartnerOrder,
  selectedPartnerId,
  onChangeOrderType,
  onUpdateTableNumber,
  onUpdateCustomerName,
  onUpdateQuantity,
  onChangePaymentMode,
  onTogglePartner,
  onSelectPartner,
  onChangeCommission,
  onSaveFakturGantung,
  onPayNow,
  onOpenVoidModal,
  onClearCart,
}: OrderCartProps) {
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <aside 
      aria-label="Keranjang Pesanan Kasir" 
      className="bg-[#FFFDF7] border border-[#DCC7AA] rounded-3xl shadow-sm flex flex-col h-full overflow-hidden"
    >
      {/* 1. Header & Options (FIXED) */}
      <div className="shrink-0 flex flex-col gap-4 px-6 pt-6 pb-2">
        {/* Title & Clear */}
        <div className="flex items-start justify-between gap-2">
          <div className="shrink-0">
            <h2 className="text-lg font-black tracking-tight text-[#4B3832]">
              Nota Pesanan
            </h2>
            <p className="text-xs font-bold text-[#6F4E37]">#27362</p>
          </div>
          {/* Tombol Options / Clear */}
          <div className="flex flex-wrap justify-end items-center gap-2">
            {/* Tombol Mitra Travel / Guide */}
            <button
              type="button"
              onClick={() => setIsTravelModalOpen(true)}
              className={`h-9 px-3 flex items-center justify-center rounded-xl border border-[#DCC7AA] transition-colors shadow-sm ${
                (selectedPartnerId.trim() !== '' || guideCommission > 0) ? 'bg-[#4B3832] text-[#FFFDF7]' : 'bg-[#FFFDF7] text-[#6F4E37] hover:bg-[#F5E6CA]'
              }`}
              title="Mitra Agen / Tour Guide"
            >
              <span className="text-[10px] font-black uppercase tracking-wider">Guide</span>
            </button>

            {/* Tombol Kosongkan Keranjang */}
            <button
              type="button"
              onClick={onClearCart}
              disabled={items.length === 0}
              className={`px-3 h-9 flex items-center justify-center rounded-xl border border-[#DCC7AA] text-[10px] font-black tracking-wider uppercase transition-colors shadow-sm ${
                items.length > 0 
                  ? 'text-[#ef4444] bg-[#FFFDF7] hover:bg-[#F5E6CA]' 
                  : 'text-[#DCC7AA] bg-[#FFFDF7] opacity-50 cursor-not-allowed'
              }`}
              title="Kosongkan Keranjang"
            >
              Kosongkan Keranjang
            </button>
          </div>
        </div>

        {/* Dine-In vs Takeaway */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeOrderType('dine_in')}
            className={`flex-1 py-2 px-3 rounded-full font-bold text-xs transition-all duration-300 ${
              orderType === 'dine_in'
                ? 'bg-[#4B3832] text-[#FFFDF7] shadow-sm'
                : 'bg-transparent text-[#6F4E37] border border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Makan Sini
          </button>
          <button
            type="button"
            onClick={() => onChangeOrderType('takeaway')}
            className={`flex-1 py-2 px-3 rounded-full font-bold text-xs transition-all duration-300 ${
              orderType === 'takeaway'
                ? 'bg-[#4B3832] text-[#FFFDF7] shadow-sm'
                : 'bg-transparent text-[#6F4E37] border border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Bungkus
          </button>
        </div>

        {/* Input Nomor Meja & Nama Pelanggan */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
            <label htmlFor="customer-name" className="block text-[10px] font-bold text-[#6F4E37] mb-1">Nama Pelanggan</label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => onUpdateCustomerName(e.target.value)}
              placeholder={orderType === 'takeaway' ? 'Bungkus' : 'Nama Tamu'}
              className="w-full bg-transparent border border-[#DCC7AA] focus:border-[#4B3832] rounded-xl px-3 py-2 font-bold text-xs text-[#4B3832] outline-none transition-all"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="table-number" className="block text-[10px] font-bold text-[#6F4E37] mb-1">Nomor Meja</label>
            <input
              id="table-number"
              type="text"
              disabled={orderType === 'takeaway'}
              value={orderType === 'takeaway' ? 'TA' : tableNumber}
              onChange={(e) => onUpdateTableNumber(e.target.value)}
              placeholder="00"
              className={`w-full bg-transparent border border-[#DCC7AA] focus:border-[#4B3832] rounded-xl px-3 py-2 font-bold text-xs text-[#4B3832] outline-none transition-all ${
                orderType === 'takeaway' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#6F4E37] mt-2 border-b border-[#DCC7AA]/30 pb-2">Daftar Pesanan</h3>
      </div>

      {/* 2. Daftar Item Pesanan (SCROLLABLE AREA) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 min-h-0">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#8B7355]">
            <p className="font-bold text-sm">Keranjang masih kosong.</p>
          </div>
        ) : (
          <ul className="space-y-3 pb-4">
            {items.map((item) => (
              <li
                key={item.productId}
                className="bg-[#FFFDF7] border border-[#DCC7AA]/50 rounded-2xl p-3 flex flex-col gap-2 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#4B3832] leading-tight pr-2">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-bold text-[#6F4E37] mt-0.5">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-[#4B3832] shrink-0">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#6F4E37] bg-[#F5E6CA] px-2 py-0.5 rounded-md font-bold">Reguler</span>
                  
                  {/* Kontrol Kuantitas */}
                  <div className="flex items-center gap-2 bg-[#F5E6CA]/50 border border-[#DCC7AA]/50 px-2 py-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.productId, -1)}
                      className="text-[#4B3832] font-black w-4 flex justify-center"
                    >
                      -
                    </button>
                    <span className="w-3 text-center font-bold text-xs text-[#4B3832]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.productId, 1)}
                      className="text-[#4B3832] font-black w-4 flex justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. Footer Kalkulasi & CTA (FIXED) */}
      <div className="shrink-0 bg-[#FFFDF7] border-t border-[#DCC7AA]/30 px-6 pt-4 pb-6 space-y-4">
        
        {/* Compact Payment Mode selection */}
        <div className="grid grid-cols-2 gap-3">
           <button
            type="button"
            onClick={() => onChangePaymentMode('pay_now')}
            className={`py-2 px-2 rounded-xl font-bold text-[10px] uppercase transition-all duration-300 border ${
              paymentMode === 'pay_now'
                ? 'bg-[#4B3832] text-[#FFFDF7] border-[#4B3832] shadow-sm'
                : 'bg-transparent text-[#6F4E37] border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Lunas / Tunai
          </button>
          <button
            type="button"
            onClick={() => onChangePaymentMode('save_faktur')}
            className={`py-2 px-2 rounded-xl font-bold text-[10px] uppercase transition-all duration-300 border ${
              paymentMode === 'save_faktur'
                ? 'bg-[#4B3832] text-[#FFFDF7] border-[#4B3832] shadow-sm'
                : 'bg-transparent text-[#6F4E37] border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Faktur Gantung
          </button>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-xs font-bold text-[#4B3832] mb-1">Rincian Tagihan</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[#6F4E37]">
              <span>Subtotal</span>
              <span className="font-bold text-[#4B3832]">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6F4E37]">
              <span>Pajak (0%)</span>
              <span className="font-bold text-[#4B3832]">Rp 0</span>
            </div>
            {dpAmount > 0 && (
              <div className="flex justify-between text-[#22c55e]">
                <span>DP Dibayar</span>
                <span className="font-bold">- {formatRupiah(dpAmount)}</span>
              </div>
            )}
            {guideCommission > 0 && (
              <div className="flex justify-between text-[#ef4444]">
                <span>Komisi Guide</span>
                <span className="font-bold">- {formatRupiah(guideCommission)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#DCC7AA]/30 flex justify-between items-center mt-1">
              <span className="text-sm font-bold text-[#6F4E37]">Total</span>
              <span className="text-lg font-black text-[#4B3832]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol CTA Utama */}
        <div className="mt-2">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={paymentMode === 'pay_now' ? onPayNow : onSaveFakturGantung}
            className="w-full flex items-center justify-between bg-[#4B3832] hover:bg-[#6F4E37] disabled:bg-[#DCC7AA] disabled:cursor-not-allowed text-[#FFFDF7] font-bold py-3.5 px-5 rounded-full shadow-lg transition-all active:scale-[0.98]"
          >
            <span className="bg-[#FFFDF7] text-[#4B3832] w-7 h-7 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
            <span className="flex-1 text-center text-xs uppercase tracking-widest">
              {paymentMode === 'pay_now' ? 'Proses Pesanan' : 'Simpan Faktur'}
            </span>
            <span className="text-xs">
              {formatRupiah(grandTotal)}
            </span>
          </button>
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onOpenVoidModal}
            className="text-[10px] font-bold text-[#ef4444] hover:underline uppercase tracking-wide"
          >
            Batal Transaksi
          </button>
        </div>
      </div>

      {/* Modal Travel Partner */}
      {isTravelModalOpen && (
        <div className="absolute inset-0 z-50 bg-[#FFFDF7]/60 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <div className="bg-[#FFFDF7] border border-[#DCC7AA] shadow-xl rounded-3xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-[#4B3832] px-5 py-4 flex justify-between items-center">
              <h3 className="text-[#FFFDF7] font-bold text-sm tracking-wide">Pengaturan Tour Guide</h3>
              <button onClick={() => setIsTravelModalOpen(false)} className="text-[#FFFDF7]/70 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5">
              <TravelPartnerSelector
                partners={partners}
                isPartnerOrder={isPartnerOrder}
                selectedPartnerId={selectedPartnerId}
                guideCommission={guideCommission}
                onTogglePartner={onTogglePartner}
                onSelectPartner={onSelectPartner}
                onChangeCommission={onChangeCommission}
              />
              <button 
                type="button"
                onClick={() => setIsTravelModalOpen(false)}
                className="w-full mt-6 bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] font-bold py-3 rounded-xl transition-colors"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
