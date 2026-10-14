// src/components/pos/TravelPartnerSelector.tsx
'use client';

import React, { useState } from 'react';
import { User, Ticket, Lightbulb, Check } from 'lucide-react';

export interface AppliedGuideVoucher {
  code: string;
  guideName: string;
  rewards: {
    cashbackAmount?: number;
    discountPercentage?: number;
    freeProducts?: Array<{
      productId: string;
      quantity: number;
    }>;
  };
}

export interface GuideInfo {
  isGuideOrder: boolean;
  guideName: string;
}

interface TravelPartnerSelectorProps {
  guideInfo: GuideInfo;
  onUpdateGuideInfo: (info: GuideInfo) => void;
  appliedVoucher: AppliedGuideVoucher | null;
  onApplyVoucher: (voucher: AppliedGuideVoucher | null) => void;
  onClose: () => void;
}

export function TravelPartnerSelector({
  guideInfo,
  onUpdateGuideInfo,
  appliedVoucher,
  onApplyVoucher,
  onClose
}: TravelPartnerSelectorProps) {
  // Local state agar kasir bisa konfirmasi perubahan sebelum disimpan
  const [isGuideOrder, setIsGuideOrder] = useState<boolean>(guideInfo.isGuideOrder);
  const [guideName, setGuideName] = useState<string>(guideInfo.guideName || '');

  // State untuk voucher
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'mark' | 'claim'>(appliedVoucher ? 'claim' : 'mark');

  // Handler Simpan Tandai Guide
  const handleSaveGuide = () => {
    onUpdateGuideInfo({
      isGuideOrder,
      guideName: isGuideOrder ? (guideName.trim() || 'Guide') : ''
    });
    onClose();
  };

  // Handler Hapus Tanda Guide
  const handleRemoveGuide = () => {
    setIsGuideOrder(false);
    setGuideName('');
    onUpdateGuideInfo({
      isGuideOrder: false,
      guideName: ''
    });
    onClose();
  };

  // Handler Validasi Voucher
  const handleValidateVoucher = async () => {
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
        throw new Error(data.error || 'Kode voucher tidak valid atau sudah digunakan');
      }

      onApplyVoucher({
        code: data.code,
        guideName: data.guideName,
        rewards: data.rewards
      });
      setCode('');
      onClose(); // Auto close on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    onApplyVoucher(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFDF7]">
      {/* Tab Switcher */}
      <div className="flex border-b border-[#DCC7AA] bg-[#F5E6CA]/40">
        <button 
          type="button"
          className={`flex-1 py-3 text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'mark' 
              ? 'bg-[#FFFDF7] text-[#4B3832] border-b-2 border-[#4B3832] shadow-xs' 
              : 'text-[#8B7355] hover:bg-[#F5E6CA]/70'
          }`}
          onClick={() => setActiveTab('mark')}
        >
          <User className="w-4 h-4" />
          <span>Tamu Bawaan Guide</span>
          {isGuideOrder && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>
        <button 
          type="button"
          className={`flex-1 py-3 text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'claim' 
              ? 'bg-[#FFFDF7] text-[#4B3832] border-b-2 border-[#4B3832] shadow-xs' 
              : 'text-[#8B7355] hover:bg-[#F5E6CA]/70'
          }`}
          onClick={() => setActiveTab('claim')}
        >
          <Ticket className="w-4 h-4" />
          <span>Klaim Kode Voucher</span>
          {appliedVoucher && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>
      </div>

      {/* Konten Tab */}
      <div className="p-6 space-y-5">
        {/* TAB 1: TAMU GUIDE */}
        {activeTab === 'mark' && (
          <div className="space-y-4">
            {/* Kartu Checklist Utama */}
            <div 
              onClick={() => setIsGuideOrder(!isGuideOrder)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                isGuideOrder 
                  ? 'bg-[#F5E6CA] border-[#4B3832] shadow-sm' 
                  : 'bg-white border-[#DCC7AA]/70 hover:border-[#DCC7AA]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 border transition-all ${
                  isGuideOrder 
                    ? 'bg-[#4B3832] border-[#4B3832] text-white shadow-xs' 
                    : 'bg-white border-gray-300'
                }`}>
                  {isGuideOrder && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-[#4B3832] text-sm leading-snug">
                    Tandai sebagai Pesanan Tamu Guide
                  </h4>
                  <p className="text-xs text-[#6F4E37] mt-1 leading-relaxed">
                    Centang jika pesanan ini dibawa oleh Tour Guide / Supir Travel. Owner akan dapat menghitung reward komisi guide di menu admin.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Nama Guide (Aktif jika dicentang) */}
            {isGuideOrder && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 pt-1">
                <label className="block text-xs font-black uppercase tracking-wider text-[#6F4E37]">
                  Nama Guide / Agen <span className="text-gray-400 font-normal lowercase">(opsional)</span>
                </label>
                <input 
                  type="text"
                  autoFocus
                  placeholder="Contoh: Mas Udin, Bli Ketut, Bali Tour"
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  className="w-full bg-white border-2 border-[#DCC7AA] rounded-xl px-4 py-3 text-[#4B3832] font-bold text-sm focus:outline-none focus:border-[#4B3832] transition-colors shadow-xs"
                />
                <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 inline" />
                  <span>Boleh dikosongkan. Jika kosong, sistem otomatis menamainya <strong>&quot;Guide&quot;</strong>.</span>
                </p>
              </div>
            )}

            {/* Tombol Aksi Bawah */}
            <div className="pt-3 border-t border-[#DCC7AA]/60 flex flex-col gap-2">
              <button 
                type="button"
                onClick={handleSaveGuide}
                className="w-full bg-[#4B3832] hover:bg-[#6F4E37] text-white font-extrabold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span>{isGuideOrder ? 'Simpan & Tandai Pesanan Guide' : 'Simpan Pengaturan'}</span>
              </button>

              <div className="flex items-center justify-between gap-2 mt-1">
                {guideInfo.isGuideOrder && (
                  <button 
                    type="button"
                    onClick={handleRemoveGuide}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-3 rounded-lg transition-colors border border-red-200"
                  >
                    Hapus Tanda Guide
                  </button>
                )}
                <button 
                  type="button"
                  onClick={onClose}
                  className="text-xs font-bold text-[#6F4E37] hover:text-[#4B3832] hover:bg-gray-100 py-2 px-4 rounded-lg transition-colors ml-auto"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KLAIM VOUCHER */}
        {activeTab === 'claim' && (
          <div className="space-y-4">
            {appliedVoucher ? (
              <div className="bg-emerald-50/70 p-4 rounded-2xl border-2 border-emerald-500 space-y-3 relative shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-emerald-700 tracking-wider uppercase bg-emerald-100 px-2 py-0.5 rounded-md">VOUCHER AKTIF</span>
                    <h4 className="font-black text-[#4B3832] text-xl mt-1.5">{appliedVoucher.code}</h4>
                    <p className="text-xs font-bold text-[#6F4E37] mt-0.5">Guide: {appliedVoucher.guideName}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="px-2.5 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                    title="Hapus Voucher"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Hapus
                  </button>
                </div>

                <div className="pt-2.5 border-t border-emerald-200 text-xs font-bold text-emerald-800 space-y-1">
                  {appliedVoucher.rewards.freeProducts && appliedVoucher.rewards.freeProducts.length > 0 && (
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Makanan Gratis ditambahkan otomatis</span>
                    </p>
                  )}
                  {appliedVoucher.rewards.discountPercentage && (
                    <p className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Diskon {appliedVoucher.rewards.discountPercentage}% diterapkan pada nota</span>
                    </p>
                  )}
                  {appliedVoucher.rewards.cashbackAmount && (
                    <p className="text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md inline-block mt-1">
                      Komisi Guide: Rp {appliedVoucher.rewards.cashbackAmount.toLocaleString('id-ID')}
                    </p>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={onClose}
                  className="w-full mt-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl transition-colors shadow-sm text-xs"
                >
                  Gunakan Voucher Ini & Tutup
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black tracking-wider text-[#6F4E37] uppercase">
                    Masukkan Kode Voucher Guide
                  </label>
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="CONTOH: G-8X2F"
                      className="flex-1 min-w-0 px-4 py-3 bg-white border-2 border-[#DCC7AA] rounded-xl font-black text-[#4B3832] focus:outline-none focus:border-[#4B3832] uppercase placeholder:font-normal placeholder:normal-case text-sm"
                      onKeyDown={e => e.key === 'Enter' && handleValidateVoucher()}
                    />
                    <button 
                      type="button"
                      onClick={handleValidateVoucher}
                      disabled={isLoading || !code.trim()}
                      className="shrink-0 px-5 py-3 bg-[#4B3832] text-white rounded-xl font-bold hover:bg-[#6F4E37] disabled:opacity-50 transition-colors shadow-sm text-xs cursor-pointer"
                    >
                      {isLoading ? 'Memeriksa...' : 'Validasi'}
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold mt-1.5 animate-in fade-in">{error}</p>}
                </div>

                <p className="text-xs text-gray-500 bg-white p-3 rounded-xl border border-[#DCC7AA]/60 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[#6F4E37] shrink-0" />
                  <span>Kode voucher diberikan kepada tour guide yang telah didaftarkan oleh owner di menu Admin Guide.</span>
                </p>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="text-xs font-bold text-[#6F4E37] hover:text-[#4B3832] py-2 px-4 rounded-lg transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
