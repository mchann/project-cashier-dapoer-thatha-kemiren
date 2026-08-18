// src/components/pos/PaymentModal.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  grandTotal: number;
  onClose: () => void;
  onConfirmPayment: (amountReceived: number, change: number) => void;
}

export function PaymentModal({
  isOpen,
  grandTotal,
  onClose,
  onConfirmPayment,
}: PaymentModalProps) {
  const [amountReceivedStr, setAmountReceivedStr] = useState<string>('');

  // Reset state when modal opens/closes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen) {
      timeoutId = setTimeout(() => {
        setAmountReceivedStr('');
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen) return null;

  const amountReceived = parseInt(amountReceivedStr.replace(/\D/g, ''), 10) || 0;
  const change = amountReceived - grandTotal;
  const isSufficient = amountReceived >= grandTotal;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleQuickAmount = (amount: number) => {
    setAmountReceivedStr(amount.toString());
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    setAmountReceivedStr(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSufficient) {
      onConfirmPayment(amountReceived, change);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm p-4"
    >
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#DCC7AA]/50 flex flex-col">
        {/* Header Modal */}
        <div className="bg-[#4B3832] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#F5E6CA] rounded-full flex items-center justify-center text-[#4B3832]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
             </div>
            <h2 className="text-base font-black text-[#FFFDF7] tracking-wide">
              Pembayaran Tunai
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-[#FFFDF7]/20 text-[#FFFDF7] rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Total Tagihan */}
            <div className="text-center bg-[#F5E6CA]/50 py-4 rounded-2xl border border-[#DCC7AA]/40">
              <span className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-1">Total Tagihan</span>
              <span className="text-4xl font-black text-[#4B3832]">{formatRupiah(grandTotal)}</span>
            </div>

            {/* Input Nominal */}
            <div>
              <label htmlFor="amount-received" className="block text-sm font-bold text-[#4B3832] mb-2 text-center">
                Uang Diterima
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-2xl text-[#8B7355]">Rp</span>
                <input
                  id="amount-received"
                  type="text"
                  value={amountReceivedStr ? new Intl.NumberFormat('id-ID').format(amountReceived) : ''}
                  onChange={handleChangeInput}
                  placeholder="0"
                  autoFocus
                  className="w-full bg-white border-2 border-[#DCC7AA] rounded-2xl pl-14 pr-4 py-4 font-black text-3xl text-[#4B3832] text-right focus:border-[#4B3832] outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickAmount(grandTotal)}
                className="py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-black text-xs transition-colors border border-emerald-200"
              >
                Uang Pas
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(50000)}
                className="py-2.5 bg-[#FFFDF7] hover:bg-[#F5E6CA] border border-[#DCC7AA] text-[#4B3832] rounded-xl font-bold text-xs transition-colors"
              >
                50.000
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount(100000)}
                className="py-2.5 bg-[#FFFDF7] hover:bg-[#F5E6CA] border border-[#DCC7AA] text-[#4B3832] rounded-xl font-bold text-xs transition-colors"
              >
                100.000
              </button>
            </div>

            {/* Kembalian */}
            <div className="pt-4 border-t border-[#DCC7AA]/40 flex justify-between items-center">
              <span className="text-sm font-bold text-[#6F4E37]">Kembalian</span>
              <span className={`text-2xl font-black ${change > 0 ? 'text-emerald-600' : 'text-[#8B7355]'}`}>
                {change > 0 ? formatRupiah(change) : 'Rp 0'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 px-4 bg-transparent border border-[#DCC7AA] hover:bg-[#F5E6CA] text-[#6F4E37] font-bold text-sm rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!isSufficient}
                className="flex-1 py-3.5 px-4 bg-[#22c55e] hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
              >
                Konfirmasi
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
