'use client';

import React, { useState, useEffect } from 'react';

interface GuideVoucher {
  _id: string;
  code: string;
  guideName: string;
  rewardType: 'discount' | 'cashback';
  amountType: 'percentage' | 'nominal';
  amount: number;
  status: 'active' | 'used';
  usedAt?: string;
  createdAt: string;
}

export default function GuideVoucherPage() {
  const [vouchers, setVouchers] = useState<GuideVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [guideName, setGuideName] = useState('');
  const [rewardType, setRewardType] = useState<'discount'|'cashback'>('cashback');
  const [amountType, setAmountType] = useState<'percentage'|'nominal'>('percentage');
  const [amount, setAmount] = useState('');

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/guides');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch vouchers', err);
      setVouchers([]);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guideName,
          rewardType,
          amountType,
          amount: Number(amount)
        })
      });

      if (!res.ok) {
        throw new Error('Gagal membuat voucher');
      }

      setGuideName('');
      setAmount('');
      fetchVouchers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      await fetch(`/api/admin/guides?id=${id}`, { method: 'DELETE' });
      fetchVouchers();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4B3832] mb-2">Manajemen Tour Guide</h1>
        <p className="text-[#8B7355]">Buat kode voucher untuk potongan tagihan atau cashback tunai ke Tour Guide.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Pembuatan Voucher */}
        <div className="bg-[#FFFDF7] p-6 rounded-2xl shadow-sm border border-[#DCC7AA]/50 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold text-[#4B3832] mb-6">Buat Kode Baru</h2>
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#8B7355] mb-2">Nama Guide / Agen</label>
              <input 
                type="text" 
                required
                value={guideName}
                onChange={e => setGuideName(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] outline-none"
                placeholder="Contoh: Pak Budi Travel"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#8B7355] mb-2">Tipe Voucher</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setRewardType('cashback')}
                  className={`p-2 rounded-xl text-sm font-bold transition-colors ${rewardType === 'cashback' ? 'bg-[#8B7355] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Cashback Tunai
                </button>
                <button 
                  type="button"
                  onClick={() => setRewardType('discount')}
                  className={`p-2 rounded-xl text-sm font-bold transition-colors ${rewardType === 'discount' ? 'bg-[#8B7355] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Diskon Tamu
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {rewardType === 'cashback' ? 'Tamu bayar penuh, uang keluar dari kasir untuk guide.' : 'Total tagihan tamu langsung dipotong.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#8B7355] mb-2">Besaran Nominal</label>
              <div className="flex gap-2 mb-2">
                <button 
                  type="button"
                  onClick={() => setAmountType('percentage')}
                  className={`flex-1 p-2 rounded-xl text-sm font-bold transition-colors ${amountType === 'percentage' ? 'bg-[#4B3832] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Persen (%)
                </button>
                <button 
                  type="button"
                  onClick={() => setAmountType('nominal')}
                  className={`flex-1 p-2 rounded-xl text-sm font-bold transition-colors ${amountType === 'nominal' ? 'bg-[#4B3832] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Rupiah (Rp)
                </button>
              </div>
              <div className="relative">
                {amountType === 'nominal' && <span className="absolute left-4 top-[14px] text-gray-500 font-bold">Rp</span>}
                <input 
                  type="number" 
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className={`w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] outline-none ${amountType === 'nominal' ? 'pl-10' : ''}`}
                  placeholder={amountType === 'percentage' ? "Contoh: 10" : "Contoh: 50000"}
                />
                {amountType === 'percentage' && <span className="absolute right-4 top-[14px] text-gray-500 font-bold">%</span>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#4B3832] text-white p-3 rounded-xl font-bold hover:bg-[#6F4E37] disabled:opacity-50 mt-4 transition-colors"
            >
              {isSubmitting ? 'Membuat...' : 'Generate Kode'}
            </button>
          </form>
        </div>

        {/* Tabel History Voucher */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#DCC7AA]/50 lg:col-span-2 overflow-x-auto">
          <h2 className="text-xl font-bold text-[#4B3832] mb-6">Riwayat Kode Voucher</h2>
          
          {isLoading ? (
            <div className="text-center py-10 text-gray-400">Memuat data...</div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Belum ada kode voucher dibuat.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-[#DCC7AA]/40 text-[#8B7355] text-sm uppercase">
                  <th className="pb-3 font-bold">Kode</th>
                  <th className="pb-3 font-bold">Nama Guide</th>
                  <th className="pb-3 font-bold">Nilai</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Dibuat / Dipakai</th>
                  <th className="pb-3 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {vouchers.map((v) => (
                  <tr key={v._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-4 font-mono font-bold text-lg text-[#4B3832]">{v.code}</td>
                    <td className="py-4 font-medium text-gray-800">{v.guideName}</td>
                    <td className="py-4 text-gray-600">
                      <span className="block text-xs uppercase text-gray-400 mb-1">{v.rewardType}</span>
                      <span className="font-bold text-[#8B7355]">
                        {v.amountType === 'percentage' ? `${v.amount}%` : formatRupiah(v.amount)}
                      </span>
                    </td>
                    <td className="py-4">
                      {v.status === 'active' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">AKTIF</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-bold">TERPAKAI</span>
                      )}
                    </td>
                    <td className="py-4 text-xs text-gray-500">
                      Dibuat: {formatDate(v.createdAt)}
                      {v.status === 'used' && <><br/><span className="text-red-500">Dipakai: {formatDate(v.usedAt)}</span></>}
                    </td>
                    <td className="py-4">
                      {v.status === 'active' && (
                        <button 
                          onClick={() => handleDelete(v._id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors"
                          title="Hapus"
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
    </div>
  );
}
