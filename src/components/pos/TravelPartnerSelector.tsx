// src/components/pos/TravelPartnerSelector.tsx
'use client';

import React, { useState } from 'react';

export interface AppliedGuideVoucher {
  code: string;
  guideName: string;
  rewardType: 'discount' | 'cashback';
  amountType: 'percentage' | 'nominal';
  amount: number;
}

interface TravelPartnerSelectorProps {
  appliedVoucher: AppliedGuideVoucher | null;
  onApplyVoucher: (voucher: AppliedGuideVoucher | null) => void;
  onClose: () => void;
}

export function TravelPartnerSelector({
  appliedVoucher,
  onApplyVoucher,
  onClose
}: TravelPartnerSelectorProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pos/guides/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal memvalidasi kode');
      }

      onApplyVoucher({
        code: data.code,
        guideName: data.guideName,
        rewardType: data.rewardType,
        amountType: data.amountType,
        amount: data.amount
      });
      setCode('');
      onClose(); // Auto close on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onApplyVoucher(null);
  };

  return (
    <div className="bg-[#F5E6CA] p-4 rounded-xl border-2 border-[#DCC7AA] space-y-4">
      {appliedVoucher ? (
        <div className="bg-[#FFFDF7] p-4 rounded-lg border border-[#DCC7AA] space-y-2 relative">
          <button 
            onClick={handleRemove}
            className="absolute top-3 right-3 text-red-500 hover:bg-red-50 p-1 rounded transition-colors text-xs font-bold"
            title="Hapus Voucher"
          >
            HAPUS
          </button>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Voucher Aktif
          </div>
          <div className="font-black text-xl text-[#4B3832]">
            {appliedVoucher.code}
          </div>
          <div className="text-sm font-semibold text-[#8B7355]">
            Guide: {appliedVoucher.guideName}
          </div>
          <div className="mt-2 inline-block px-2 py-1 bg-[#4B3832] text-white text-xs font-bold rounded">
            {appliedVoucher.rewardType === 'discount' ? 'Diskon Tagihan' : 'Cashback Guide'}: 
            {' '}{appliedVoucher.amountType === 'percentage' ? `${appliedVoucher.amount}%` : `Rp ${appliedVoucher.amount.toLocaleString('id-ID')}`}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label 
            htmlFor="guide-code" 
            className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider"
          >
            Kode Voucher Guide
          </label>
          <div className="flex gap-2">
            <input
              id="guide-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: G-8X2F"
              className="flex-1 min-w-0 w-full bg-[#FFFDF7] border border-[#DCC7AA] focus:border-[#4B3832] rounded-lg px-3 py-3 font-bold text-[#4B3832] outline-none transition-all uppercase text-sm"
            />
            <button
              type="button"
              onClick={handleValidate}
              disabled={isLoading || !code.trim()}
              className="shrink-0 bg-[#4B3832] text-white px-4 rounded-lg font-bold hover:bg-[#6F4E37] transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
            >
              {isLoading ? 'Cek...' : 'Validasi'}
            </button>
          </div>
          {error && <div className="text-red-500 text-xs font-bold mt-1">{error}</div>}
        </div>
      )}
    </div>
  );
}
