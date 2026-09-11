import React, { useState } from 'react';

export interface GuideVoucher {
  _id: string;
  code: string;
  guideName: string;
  sourceTransactionId?: string;
  rewards: {
    cashbackAmount?: number;
    discountPercentage?: number;
    freeProducts?: Array<{ productId: string; quantity: number }>;
  };
  status: 'active' | 'used';
  usedAt?: string;
  createdAt: string;
}

interface Props {
  isLoading: boolean;
  vouchers: GuideVoucher[];
  onDelete: (id: string) => void;
  formatRupiah: (amount: number) => string;
  formatDate: (date?: string) => string;
}

export function VoucherHistory({ isLoading, vouchers, onDelete, formatRupiah, formatDate }: Props) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  return (
    <div className="bg-[#FFFDF7] p-6 rounded-3xl shadow-sm border border-[#DCC7AA]/40 overflow-hidden">
      <h2 className="text-xl font-black text-[#4B3832] mb-6">Riwayat Kode Voucher</h2>
      
      <div className="overflow-x-auto">
        {vouchers.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-[#8B7355] font-medium">Belum ada kode voucher.</div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-[#DCC7AA]/40 text-[#8B7355] text-xs uppercase tracking-wider">
                <th className="pb-3 font-bold px-4">Kode</th>
                <th className="pb-3 font-bold px-4">Nama Guide</th>
                <th className="pb-3 font-bold px-4">Rewards (Cashback / Diskon / Gratis)</th>
                <th className="pb-3 font-bold px-4 text-center">Status</th>
                <th className="pb-3 font-bold px-4">Dibuat / Dipakai</th>
                <th className="pb-3 font-bold px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {vouchers.map((v) => (
                <tr key={v._id} className="border-b border-[#DCC7AA]/20 hover:bg-[#F5E6CA]/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-black text-lg px-2 py-0.5 rounded tracking-widest ${v.status === 'active' ? 'bg-[#DCC7AA]/50 text-[#4B3832]' : 'text-gray-400 bg-transparent'}`}>
                        {v.code}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(v.code);
                          setCopiedCode(v.code);
                          setTimeout(() => setCopiedCode(null), 2000);
                        }}
                        className={`${copiedCode === v.code ? 'text-green-600' : 'text-[#8B7355] hover:text-[#4B3832]'} transition-colors p-1 rounded-md hover:bg-[#DCC7AA]/30`}
                        title="Copy Kode"
                      >
                        {copiedCode === v.code ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-[#6F4E37]">{v.guideName}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 flex-wrap">
                      {v.rewards?.cashbackAmount ? <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">Cashback {formatRupiah(v.rewards.cashbackAmount)}</span> : null}
                      {v.rewards?.discountPercentage ? <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">Diskon {v.rewards.discountPercentage}%</span> : null}
                      {v.rewards?.freeProducts && v.rewards.freeProducts.length > 0 ? (
                        <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-md font-bold whitespace-nowrap">
                          {v.rewards.freeProducts.reduce((acc, curr) => acc + curr.quantity, 0)} Makanan Gratis
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {v.status === 'active' ? (
                      <span className="inline-block px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider">AKTIF</span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-gray-200 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">TERPAKAI</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-[#8B7355]">
                    {formatDate(v.createdAt)}
                    {v.status === 'used' && <div className="text-red-500 mt-1 font-bold">Dipakai: {formatDate(v.usedAt)}</div>}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {v.status === 'active' && (
                      <button 
                        onClick={() => onDelete(v._id)}
                        className="text-red-500 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
