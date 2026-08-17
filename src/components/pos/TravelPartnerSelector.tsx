// src/components/pos/TravelPartnerSelector.tsx
'use client';

import React from 'react';
import { Partner } from '@/types/pos';

interface TravelPartnerSelectorProps {
  partners: Partner[];
  isPartnerOrder: boolean; // Note: Kept for compatibility but we won't use it to hide/show anymore
  selectedPartnerId: string; // We will use this to store the text input value for now
  guideCommission: number;
  onTogglePartner: (checked: boolean) => void;
  onSelectPartner: (partnerId: string, partnerName: string) => void;
  onChangeCommission: (commission: number) => void;
}

export function TravelPartnerSelector({
  selectedPartnerId,
  guideCommission,
  onSelectPartner,
  onChangeCommission,
}: TravelPartnerSelectorProps) {
  return (
    <div className="bg-[#F5E6CA] p-4 rounded-xl border-2 border-[#DCC7AA] space-y-4">
      {/* Input Nama Agen / Guide */}
      <div>
        <label 
          htmlFor="partner-name" 
          className="block text-xs font-bold text-[#6F4E37] mb-1.5 uppercase tracking-wider"
        >
          Nama Tour Guide / Agen
        </label>
        <input
          id="partner-name"
          type="text"
          value={selectedPartnerId}
          onChange={(e) => {
            const val = e.target.value;
            onSelectPartner(val, val); // pass the text as both id and name for now
          }}
          placeholder="Ketik nama guide..."
          className="w-full bg-[#FFFDF7] border border-[#DCC7AA] focus:border-[#4B3832] rounded-lg px-4 py-3 font-bold text-[#4B3832] outline-none transition-all"
        />
      </div>

      {/* Input Potongan / Cashback Guide */}
      <div>
        <label 
          htmlFor="guide-commission" 
          className="block text-xs font-bold text-[#6F4E37] mb-1.5 uppercase tracking-wider"
        >
          Nominal Cashback (Rp)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#4B3832]">
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
            className="w-full bg-[#FFFDF7] border border-[#DCC7AA] focus:border-[#4B3832] rounded-lg pl-11 pr-4 py-3 font-black text-[#4B3832] text-lg outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
