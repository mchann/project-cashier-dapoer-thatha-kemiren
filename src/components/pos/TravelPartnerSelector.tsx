'use client';

import React, { useState } from 'react';

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
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'mark' | 'claim'>('mark');

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

  const handleRemove = () => {
    onApplyVoucher(null);
  };

  return (
    <div className="bg-[#FFFDF7] p-0 rounded-2xl overflow-hidden flex flex-col h-full border border-[#DCC7AA]">
      <div className="flex border-b border-[#DCC7AA]">
        <button 
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'mark' ? 'bg-[#F5E6CA] text-[#4B3832] border-b-2 border-[#4B3832]' : 'text-[#8B7355] hover:bg-gray-50'}`}
          onClick={() => setActiveTab('mark')}
        >
          Tamu Guide
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'claim' ? 'bg-[#F5E6CA] text-[#4B3832] border-b-2 border-[#4B3832]' : 'text-[#8B7355] hover:bg-gray-50'}`}
          onClick={() => setActiveTab('claim')}
        >
          Klaim Voucher
        </button>
      </div>

      <div className="p-5 space-y-4">
        {activeTab === 'mark' && (
          <div className="space-y-4">
            <div className="bg-[#F5E6CA] p-4 rounded-xl border border-[#DCC7AA]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={guideInfo.isGuideOrder}
                  onChange={(e) => onUpdateGuideInfo({ ...guideInfo, isGuideOrder: e.target.checked })}
                  className="w-5 h-5 rounded border-[#8B7355] text-[#4B3832] focus:ring-[#4B3832]"
                />
                <span className="font-bold text-[#4B3832]">Tandai sebagai Pesanan Tamu Guide</span>
              </label>
              <p className="text-xs text-[#8B7355] mt-1 ml-8">Owner akan melihat pesanan ini di riwayat dan dapat memberikan reward ke guide nanti.</p>
            </div>

            {guideInfo.isGuideOrder && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-[#6F4E37]">Nama Guide / Agen (Opsional)</label>
                <input 
                  type="text"
                  placeholder="Boleh dikosongkan (Default: 'Guide')"
                  value={guideInfo.guideName}
                  onChange={(e) => onUpdateGuideInfo({ ...guideInfo, guideName: e.target.value })}
                  className="w-full bg-white border border-[#DCC7AA] rounded-xl px-4 py-2.5 text-[#4B3832] font-bold focus:outline-none focus:border-[#4B3832] focus:ring-1 focus:ring-[#4B3832]"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'claim' && (
          <div className="space-y-4">
            {appliedVoucher ? (
              <div className="bg-[#FFFDF7] p-4 rounded-xl border-2 border-emerald-500 space-y-2 relative shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 tracking-wider uppercase">Voucher Aktif</span>
                    <h4 className="font-bold text-[#4B3832] text-lg mt-0.5">{appliedVoucher.code}</h4>
                    <p className="text-sm font-bold text-[#8B7355]">Guide: {appliedVoucher.guideName}</p>
                  </div>
                  <button 
                    onClick={handleRemove}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="Hapus Voucher"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
                <div className="pt-2 border-t border-emerald-100 mt-2 space-y-1">
                  {appliedVoucher.rewards.freeProducts && appliedVoucher.rewards.freeProducts.length > 0 && (
                    <p className="text-sm font-bold text-emerald-700">✓ Makanan Gratis ditambahkan ke keranjang</p>
                  )}
                  {appliedVoucher.rewards.discountPercentage && (
                    <p className="text-sm font-bold text-emerald-700">✓ Diskon Tambahan {appliedVoucher.rewards.discountPercentage}%</p>
                  )}
                  {appliedVoucher.rewards.cashbackAmount && (
                    <p className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded inline-block mt-1">Pencairan Tunai: Rp {appliedVoucher.rewards.cashbackAmount.toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[11px] font-black tracking-widest text-[#6F4E37] uppercase">KODE VOUCHER GUIDE</label>
                  <div className="flex gap-2 w-full">
                    <input 
                      type="text" 
                      value={code}
                      onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="CONTOH: G-8X2F"
                      className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-[#DCC7AA] rounded-xl font-bold text-[#4B3832] focus:outline-none focus:border-[#4B3832] focus:ring-1 focus:ring-[#4B3832] uppercase placeholder:normal-case placeholder:font-normal"
                      onKeyDown={e => e.key === 'Enter' && handleValidate()}
                    />
                    <button 
                      onClick={handleValidate}
                      disabled={isLoading || !code.trim()}
                      className="shrink-0 px-4 py-2.5 bg-[#8B7355] text-white rounded-xl font-bold hover:bg-[#6F4E37] disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? '...' : 'Validasi'}
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-sm font-bold mt-1 animate-in fade-in">{error}</p>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
