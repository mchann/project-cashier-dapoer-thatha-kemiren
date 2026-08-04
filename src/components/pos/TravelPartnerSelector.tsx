// src/components/pos/TravelPartnerSelector.tsx
'use client';

import React from 'react';
import { Partner } from '@/types/pos';

interface TravelPartnerSelectorProps {
  partners: Partner[];
  isPartnerOrder: boolean;
  selectedPartnerId: string;
  guideCommission: number;
  onTogglePartner: (checked: boolean) => void;
  onSelectPartner: (partnerId: string, partnerName: string) => void;
  onChangeCommission: (commission: number) => void;
}

export function TravelPartnerSelector({
  partners,
  isPartnerOrder,
  selectedPartnerId,
  guideCommission,
  onTogglePartner,
  onSelectPartner,
  onChangeCommission,
}: TravelPartnerSelectorProps) {
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="bg-[#fefce8] p-3.5 rounded-xl border-2 border-[#e7e5e4]">
      {/* Checkbox Utama Mitra Travel */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isPartnerOrder}
          onChange={(e) => onTogglePartner(e.target.checked)}
          className="w-5 h-5 rounded border-2 border-[#a8a29e] text-[#78350f] focus:ring-2 focus:ring-[#d97706] cursor-pointer"
        />
        <span className="font-extrabold text-base text-[#291404]">
          Mitra Agen Travel / Tour Guide
        </span>
      </label>

      {/* Area Dropdown & Komisi Jika Dicentang */}
      {isPartnerOrder && (
        <div className="mt-3 pt-3 border-t-2 border-[#e7e5e4] space-y-3">
          {/* Pilih Agen */}
          <div>
            <label 
              htmlFor="partner-select" 
              className="block text-sm font-bold text-[#451a03] mb-1.5"
            >
              Pilih Agen Mitra:
            </label>
            <select
              id="partner-select"
              value={selectedPartnerId}
              onChange={(e) => {
                const p = partners.find((item) => item._id === e.target.value);
                onSelectPartner(e.target.value, p?.name || '');
              }}
              className="w-full bg-white border-2 border-[#a8a29e] rounded-lg px-3 py-2 font-bold text-[#291404] focus:border-[#d97706]"
            >
              <option value="">-- Pilih Agen Travel --</option>
              {partners.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Potongan / Cashback Guide */}
          <div>
            <label 
              htmlFor="guide-commission" 
              className="block text-sm font-bold text-[#451a03] mb-1.5"
            >
              Potongan / Cashback Guide (Tunai):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#57300a]">
                Rp
              </span>
              <input
                id="guide-commission"
                type="number"
                min={0}
                step={5000}
                value={guideCommission || ''}
                onChange={(e) => onChangeCommission(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-white border-2 border-[#a8a29e] rounded-lg pl-10 pr-3 py-2 font-black text-[#291404] text-lg focus:border-[#d97706]"
              />
            </div>
            {guideCommission > 0 && (
              <p className="text-xs font-bold text-[#78350f] mt-1">
                Komisi Guide: {formatRupiah(guideCommission)} (Dipotong dari Pendapatan Kotor)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
