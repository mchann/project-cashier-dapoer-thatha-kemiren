// src/components/pos/OrderCart.tsx
'use client';

import React, { useState } from 'react';
import { OrderItem } from '@/types/pos';
import { TravelPartnerSelector, AppliedGuideVoucher, GuideInfo } from './TravelPartnerSelector';
import { User } from 'lucide-react';

interface OrderCartProps {
  orderType: 'dine_in' | 'takeaway' | 'reservation';
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  paymentMode: 'pay_now' | 'save_faktur';
  dpAmount: number;
  guideInfo: GuideInfo;
  onUpdateGuideInfo: (info: GuideInfo) => void;
  guideVoucher: AppliedGuideVoucher | null;
  onChangeOrderType: (type: 'dine_in' | 'takeaway' | 'reservation') => void;
  onUpdateTableNumber: (val: string) => void;
  onUpdateCustomerName: (val: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onChangePaymentMode: (mode: 'pay_now' | 'save_faktur') => void;
  onApplyVoucher: (voucher: AppliedGuideVoucher | null) => void;
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
  guideInfo,
  onUpdateGuideInfo,
  guideVoucher,
  onChangeOrderType,
  onUpdateTableNumber,
  onUpdateCustomerName,
  onUpdateQuantity,
  onChangePaymentMode,
  onApplyVoucher,
  onSaveFakturGantung,
  onPayNow,
  onOpenVoidModal,
  onClearCart,
}: OrderCartProps) {
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let guideCommission = 0;
  let discountAmount = 0;
  if (guideVoucher) {
    if (guideVoucher.rewards?.cashbackAmount) {
      guideCommission = guideVoucher.rewards.cashbackAmount;
    }
    if (guideVoucher.rewards?.discountPercentage) {
      discountAmount = (subtotal * guideVoucher.rewards.discountPercentage) / 100;
    }
  }
  
  const grandTotal = Math.max(0, subtotal - dpAmount - discountAmount);

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
      className="bg-[#FFFDF7] border border-[#DCC7AA] rounded-2xl shadow-sm flex flex-col h-full overflow-hidden"
    >
      {/* 1. Header & Options (FIXED) */}
      <div className="shrink-0 flex flex-col gap-2.5 px-4 pt-3.5 pb-2">
        {/* Title & Clear */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-tight text-[#4B3832]">
              Nota Pesanan
            </h2>
            <span className="text-[10px] font-bold text-[#6F4E37] bg-[#F5E6CA]/60 px-2 py-0.5 rounded-md">#27362</span>
          </div>
          {/* Tombol Options / Clear */}
          <div className="flex items-center gap-1.5">
            {/* Tombol Mitra Travel / Guide */}
            <button
              type="button"
              onClick={() => setIsTravelModalOpen(true)}
              className={`h-7 px-2.5 flex items-center justify-center rounded-lg border border-[#DCC7AA] transition-colors shadow-xs ${
                (guideVoucher || guideInfo.isGuideOrder) ? 'bg-[#4B3832] text-[#FFFDF7]' : 'bg-white text-[#6F4E37] hover:bg-[#F5E6CA]'
              }`}
              title="Pengaturan Tour Guide"
            >
              <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3 shrink-0" />
                <span>{guideInfo.isGuideOrder ? (guideInfo.guideName || 'Guide') : 'Guide'}</span>
              </span>
            </button>

            {/* Tombol Kosongkan Keranjang */}
            <button
              type="button"
              onClick={onClearCart}
              disabled={items.length === 0}
              className={`px-2.5 h-7 flex items-center justify-center rounded-lg border border-[#DCC7AA] text-[10px] font-black tracking-wider uppercase transition-colors shadow-xs ${
                items.length > 0 
                  ? 'text-[#ef4444] bg-white hover:bg-red-50' 
                  : 'text-[#DCC7AA] bg-white opacity-50 cursor-not-allowed'
              }`}
              title="Kosongkan Keranjang"
            >
              Kosongkan
            </button>
          </div>
        </div>

        {/* Dine-In vs Takeaway */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeOrderType('dine_in')}
            className={`flex-1 py-1.5 px-3 rounded-full font-bold text-xs transition-all duration-300 ${
              orderType === 'dine_in'
                ? 'bg-[#4B3832] text-[#FFFDF7] shadow-xs'
                : 'bg-transparent text-[#6F4E37] border border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Makan Sini
          </button>
          <button
            type="button"
            onClick={() => onChangeOrderType('takeaway')}
            className={`flex-1 py-1.5 px-3 rounded-full font-bold text-xs transition-all duration-300 ${
              orderType === 'takeaway'
                ? 'bg-[#4B3832] text-[#FFFDF7] shadow-xs'
                : 'bg-transparent text-[#6F4E37] border border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Bungkus
          </button>
          {orderType === 'reservation' && (
            <div className="flex-1 py-1.5 px-3 rounded-full font-bold text-xs text-center bg-[#4B3832] text-[#FFFDF7] shadow-xs cursor-default">
              Reservasi
            </div>
          )}
        </div>

        {/* Input Nomor Meja & Nama Pelanggan */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1">
            <label htmlFor="customer-name" className="block text-[10px] font-bold text-[#6F4E37] mb-0.5">Nama Pelanggan</label>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => onUpdateCustomerName(e.target.value)}
              placeholder={orderType === 'takeaway' ? 'Bungkus' : 'Nama Tamu'}
              className="w-full bg-white border border-[#DCC7AA] focus:border-[#4B3832] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#4B3832] outline-none transition-all"
            />
          </div>
          <div className="col-span-1">
            <label htmlFor="table-number" className="block text-[10px] font-bold text-[#6F4E37] mb-0.5">Nomor Meja</label>
            <input
              id="table-number"
              type="text"
              disabled={orderType === 'takeaway'}
              value={orderType === 'takeaway' ? 'TA' : tableNumber}
              onChange={(e) => onUpdateTableNumber(e.target.value)}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (/^[1-9]$/.test(val)) {
                  onUpdateTableNumber(`0${val}`);
                }
              }}
              placeholder="00"
              className={`w-full bg-white border border-[#DCC7AA] focus:border-[#4B3832] rounded-xl px-2.5 py-1.5 font-bold text-xs text-[#4B3832] outline-none transition-all ${
                orderType === 'takeaway' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Active Guide Banner */}
        {guideInfo.isGuideOrder && (
          <div className="flex items-center justify-between bg-[#F5E6CA] border border-[#DCC7AA] px-3 py-1.5 rounded-xl text-xs shadow-xs animate-in fade-in">
            <span className="font-bold text-[#4B3832] flex items-center gap-1.5 truncate text-[11px]">
              <span className="bg-[#4B3832] text-white px-1.5 py-0.2 rounded text-[9px] font-black">GUIDE</span>
              <span className="truncate">Tamu: <strong>{guideInfo.guideName || 'Guide'}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setIsTravelModalOpen(true)}
              className="text-[10px] font-black text-[#6F4E37] underline hover:text-[#4B3832] shrink-0 ml-2"
            >
              Ubah
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-[#DCC7AA]/30 pb-1 mt-0.5">
          <span className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Daftar Pesanan</span>
          <span className="text-[10px] font-bold text-[#4B3832] bg-[#F5E6CA] px-2 py-0.5 rounded-full">
            {items.reduce((s, i) => s + i.quantity, 0)} Item
          </span>
        </div>
      </div>

      {/* 2. Daftar Item Pesanan (SCROLLABLE AREA) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 min-h-0">
        {items.length === 0 ? (
          <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center text-[#8B7355]">
            <p className="font-bold text-xs">Keranjang masih kosong.</p>
          </div>
        ) : (
          <ul className="space-y-2 pb-2">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.isFree ? 'free' : 'paid'}`}
                className="bg-white border border-[#DCC7AA]/50 rounded-xl p-2.5 flex flex-col gap-1.5 transition-colors shadow-xs"
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
                  <p className="font-bold text-xs text-[#4B3832] shrink-0">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  {item.isFree ? (
                    <span className="text-[9px] text-white bg-emerald-500 px-1.5 py-0.5 rounded font-bold">Gratis Guide</span>
                  ) : (
                    <span className="text-[9px] text-[#6F4E37] bg-[#F5E6CA] px-1.5 py-0.5 rounded font-bold">Reguler</span>
                  )}
                  
                  {/* Kontrol Kuantitas */}
                  <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full ${item.isFree ? 'opacity-50' : 'bg-[#F5E6CA]/50 border border-[#DCC7AA]/50'}`}>
                    <button
                      type="button"
                      onClick={() => !item.isFree && onUpdateQuantity(item.productId, -1)}
                      disabled={item.isFree}
                      className="text-[#4B3832] font-black w-4 flex justify-center disabled:cursor-not-allowed text-xs"
                    >
                      {item.isFree ? '' : '-'}
                    </button>
                    <span className="w-3 text-center font-bold text-xs text-[#4B3832]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => !item.isFree && onUpdateQuantity(item.productId, 1)}
                      disabled={item.isFree}
                      className="text-[#4B3832] font-black w-4 flex justify-center disabled:cursor-not-allowed text-xs"
                    >
                      {item.isFree ? '' : '+'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. Footer Kalkulasi & CTA (FIXED) */}
      <div className="shrink-0 bg-[#FFFDF7] border-t border-[#DCC7AA]/30 px-4 pt-2.5 pb-3 space-y-2.5">
        
        {/* Compact Payment Mode selection */}
        <div className="grid grid-cols-2 gap-2">
           <button
            type="button"
            onClick={() => onChangePaymentMode('pay_now')}
            className={`py-1.5 px-2 rounded-xl font-bold text-[10px] uppercase transition-all duration-300 border ${
              paymentMode === 'pay_now'
                ? 'bg-[#4B3832] text-[#FFFDF7] border-[#4B3832] shadow-xs'
                : 'bg-transparent text-[#6F4E37] border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Lunas / Tunai
          </button>
          <button
            type="button"
            onClick={() => onChangePaymentMode('save_faktur')}
            className={`py-1.5 px-2 rounded-xl font-bold text-[10px] uppercase transition-all duration-300 border ${
              paymentMode === 'save_faktur'
                ? 'bg-[#4B3832] text-[#FFFDF7] border-[#4B3832] shadow-xs'
                : 'bg-transparent text-[#6F4E37] border-[#DCC7AA] hover:bg-[#F5E6CA]'
            }`}
          >
            Faktur Gantung
          </button>
        </div>

        {/* Payment Details */}
        <div>
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
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#22c55e]">
                <span>Diskon Guide</span>
                <span className="font-bold">- {formatRupiah(discountAmount)}</span>
              </div>
            )}
            {guideCommission > 0 && (
              <div className="flex justify-between text-[#ef4444]">
                <span>Cashback Guide (K)</span>
                <span className="font-bold">({formatRupiah(guideCommission)})</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-[#DCC7AA]/30 flex justify-between items-center mt-0.5">
              <span className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Total</span>
              <span className="text-base font-black text-[#4B3832]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol CTA Utama */}
        <div>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={paymentMode === 'pay_now' ? onPayNow : onSaveFakturGantung}
            className="w-full flex items-center justify-between bg-[#4B3832] hover:bg-[#6F4E37] disabled:bg-[#DCC7AA] disabled:cursor-not-allowed text-[#FFFDF7] font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <span className="bg-[#FFFDF7] text-[#4B3832] w-6 h-6 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
            <span className="flex-1 text-center text-xs font-extrabold uppercase tracking-wider">
              {paymentMode === 'pay_now' ? 'Proses Pesanan' : 'Simpan Faktur'}
            </span>
            <span className="text-xs font-black">
              {formatRupiah(grandTotal)}
            </span>
          </button>
        </div>

        <div className="text-center pt-0.5">
          <button
            type="button"
            onClick={onOpenVoidModal}
            className="text-[10px] font-bold text-[#ef4444] hover:underline uppercase tracking-wide"
          >
            Batal Transaksi
          </button>
        </div>
      </div>

      {/* Modal Travel Partner / Tour Guide */}
      {isTravelModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#4B3832]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsTravelModalOpen(false)}
        >
          <div 
            className="bg-[#FFFDF7] border border-[#DCC7AA] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#4B3832] px-6 py-4 flex justify-between items-center text-white">
              <div>
                <h3 className="text-white font-extrabold text-base tracking-wide flex items-center gap-2">
                  <User className="w-5 h-5 text-[#DCC7AA] shrink-0" />
                  <span>Pengaturan Tour Guide</span>
                </h3>
                <p className="text-xs text-[#DCC7AA] mt-0.5">Tandai pesanan tamu guide atau klaim voucher</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsTravelModalOpen(false)} 
                className="p-1 hover:bg-[#6F4E37] rounded-full transition-colors text-white"
                title="Tutup"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto">
              <TravelPartnerSelector
                guideInfo={guideInfo}
                onUpdateGuideInfo={onUpdateGuideInfo}
                appliedVoucher={guideVoucher}
                onApplyVoucher={onApplyVoucher}
                onClose={() => setIsTravelModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
