'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StaffData } from '@/components/admin/StaffModal';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  notes: string;
  date: string;
}

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Expense[]>([]);
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [detailModalData, setDetailModalData] = useState<string | null>(null);

  // Filter State
  const [viewMode, setViewMode] = useState<'month' | 'today' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    staffName: '',
    date: new Date().toISOString().split('T')[0],
    periodeStart: '',
    periodeEnd: '',
    pokok: '',
    bonus: '',
    potongan: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resExpenses, resStaff] = await Promise.all([
        fetch('/api/admin/expenses'),
        fetch('/api/admin/staff')
      ]);
      
      if (resExpenses.ok) {
        const data = await resExpenses.json();
        if (Array.isArray(data)) {
          // Filter only Gaji
          setPayrolls(data.filter(e => e.category.toLowerCase() === 'gaji'));
        }
      }

      if (resStaff.ok) {
        const staffData = await resStaff.json();
        if (Array.isArray(staffData)) setStaffList(staffData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPokok = parseInt(formData.pokok.replace(/\D/g, '') || '0', 10);
  const totalBonus = parseInt(formData.bonus.replace(/\D/g, '') || '0', 10);
  const totalPotongan = parseInt(formData.potongan.replace(/\D/g, '') || '0', 10);
  const totalBersih = totalPokok + totalBonus - totalPotongan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.staffName || !formData.date || totalBersih < 0) {
      alert('Mohon lengkapi data dengan benar. Total bersih tidak boleh minus.');
      return;
    }

    setIsSaving(true);
    try {
      // Format tanggal ke lokal
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      };
      const periodeStr = `${formatDate(formData.periodeStart)} s/d ${formatDate(formData.periodeEnd)}`;

      const submitData = {
        title: `Gaji: ${formData.staffName}`,
        amount: totalBersih,
        category: 'Gaji',
        date: formData.date,
        notes: `Periode: ${periodeStr} | Pokok: Rp ${totalPokok.toLocaleString('id-ID')} | Bonus: Rp ${totalBonus.toLocaleString('id-ID')} | Potongan: Rp ${totalPotongan.toLocaleString('id-ID')}`
      };

      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ staffName: '', date: new Date().toISOString().split('T')[0], periodeStart: '', periodeEnd: '', pokok: '', bonus: '', potongan: '' });
        fetchData();
      } else {
        alert('Gagal merekam gaji');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(e => {
      let matchDate = true;
      if (viewMode === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchDate = e.date.startsWith(todayStr);
      } else if (viewMode === 'month') {
        const monthStr = new Date().toISOString().slice(0, 7);
        matchDate = e.date.startsWith(monthStr);
      }
      
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' || e.title.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q));

      return matchDate && matchSearch;
    });
  }, [payrolls, viewMode, searchQuery]);

  const totalNominalGaji = useMemo(() => {
    return filteredPayrolls.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredPayrolls]);

  return (
    <div className="p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4B3832]">Penggajian</h1>
          <p className="text-[#6F4E37] font-medium">Catat dan pantau pembayaran gaji karyawan.</p>
        </div>
        
        <button 
          onClick={() => {
            setFormData({ staffName: '', date: new Date().toISOString().split('T')[0], periodeStart: '', periodeEnd: '', pokok: '', bonus: '', potongan: '' });
            setIsModalOpen(true);
          }}
          className="bg-[#4B3832] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-[#6F4E37] transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Catat Gaji
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 group-hover:scale-110 transition-transform"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Total Gaji (Sesuai Filter)</p>
           <h3 className="text-4xl font-black text-red-600 relative z-10">Rp {totalNominalGaji.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-gray-500 group-hover:scale-110 transition-transform"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 01-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Jumlah Pembayaran</p>
           <h3 className="text-4xl font-black text-gray-700 relative z-10">{filteredPayrolls.length} Data</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#DCC7AA] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#DCC7AA] flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setViewMode('today')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-black transition-all ${viewMode === 'today' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500'}`}>Hari Ini</button>
            <button onClick={() => setViewMode('month')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-black transition-all ${viewMode === 'month' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500'}`}>Bulan Ini</button>
            <button onClick={() => setViewMode('all')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-black transition-all ${viewMode === 'all' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500'}`}>Semua</button>
          </div>
          <div className="relative w-full md:w-64">
            <input type="text" placeholder="Cari nama karyawan..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFFDF7] text-xs uppercase font-black text-[#6F4E37] border-b">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Nama Karyawan</th>
                <th className="px-6 py-4">Rincian Pembayaran</th>
                <th className="px-6 py-4 text-right">Total Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : filteredPayrolls.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Belum ada data gaji</td></tr>
              ) : (
                filteredPayrolls.map(pay => (
                  <tr key={pay._id} className="hover:bg-amber-50/50">
                    <td className="px-6 py-4">{new Date(pay.date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 font-bold">{pay.title.replace('Gaji: ', '')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#F5E6CA] text-[#6F4E37] px-2 py-1 rounded text-[10px] font-bold w-fit">
                          {pay.notes.split('|')[0].trim()}
                        </span>
                        <button 
                          onClick={() => setDetailModalData(pay.notes)}
                          className="text-xs text-[#4B3832] font-black underline hover:text-amber-700"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-red-600 font-black">Rp {pay.amount.toLocaleString('id-ID')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-[#FFFDF7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#DCC7AA]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#DCC7AA] flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-[#4B3832]">Catat Pembayaran Gaji</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white max-h-[75vh] overflow-y-auto">
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nama Karyawan</label>
                <input 
                  type="text" 
                  value={formData.staffName}
                  onChange={e => {
                    setFormData({...formData, staffName: e.target.value});
                    setShowStaffDropdown(true);
                  }}
                  onFocus={() => setShowStaffDropdown(true)}
                  onBlur={() => setTimeout(() => setShowStaffDropdown(false), 200)}
                  required
                  placeholder="Pilih atau ketik nama karyawan"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]"
                />
                
                {/* Custom Dropdown */}
                {showStaffDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#DCC7AA] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {staffList.filter(s => s.name.toLowerCase().includes(formData.staffName.toLowerCase())).length > 0 ? (
                      staffList.filter(s => s.name.toLowerCase().includes(formData.staffName.toLowerCase())).map(s => (
                        <div 
                          key={s._id} 
                          className="px-4 py-2 hover:bg-[#F5E6CA] cursor-pointer text-[#4B3832] font-semibold"
                          onClick={() => {
                            setFormData({...formData, staffName: s.name});
                            setShowStaffDropdown(false);
                          }}
                        >
                          {s.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">
                        {formData.staffName ? 'Karyawan tidak ditemukan. (Nama ini akan disimpan sebagai karyawan baru di data gaji)' : 'Ketik nama karyawan...'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Tgl Pembayaran</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Periode (Mulai)</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.periodeStart} 
                    onChange={e => {
                      const startStr = e.target.value;
                      // Auto-fill end date only if it's empty
                      if (!formData.periodeEnd) {
                        const startDate = new Date(startStr);
                        startDate.setDate(startDate.getDate() + 6);
                        const endStr = startDate.toISOString().split('T')[0];
                        setFormData({...formData, periodeStart: startStr, periodeEnd: endStr});
                      } else {
                        setFormData({...formData, periodeStart: startStr});
                      }
                    }} 
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Periode (Akhir)</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.periodeEnd} 
                    onChange={e => setFormData({...formData, periodeEnd: e.target.value})} 
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" 
                  />
                </div>
              </div>

              {/* Durasi & Quick Select */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <span className="text-xs font-bold text-[#6F4E37]">
                  Total Durasi: {' '}
                  {formData.periodeStart && formData.periodeEnd ? (
                    (() => {
                      const start = new Date(formData.periodeStart);
                      const end = new Date(formData.periodeEnd);
                      const diffTime = end.getTime() - start.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      return diffDays > 0 ? <span className="text-[#4B3832] font-black">{diffDays} Hari</span> : <span className="text-red-500">Tanggal tidak valid</span>;
                    })()
                  ) : '-'}
                </span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    if(!formData.periodeStart) return;
                    const d = new Date(formData.periodeStart); d.setDate(d.getDate() + 6);
                    setFormData({...formData, periodeEnd: d.toISOString().split('T')[0]});
                  }} className="text-[10px] bg-white border border-[#DCC7AA] text-[#6F4E37] px-2 py-1.5 rounded-lg font-bold hover:bg-[#F5E6CA] transition-colors shadow-sm">1 Minggu</button>
                  <button type="button" onClick={() => {
                    if(!formData.periodeStart) return;
                    const d = new Date(formData.periodeStart); d.setDate(d.getDate() + 13);
                    setFormData({...formData, periodeEnd: d.toISOString().split('T')[0]});
                  }} className="text-[10px] bg-white border border-[#DCC7AA] text-[#6F4E37] px-2 py-1.5 rounded-lg font-bold hover:bg-[#F5E6CA] transition-colors shadow-sm">2 Minggu</button>
                  <button type="button" onClick={() => {
                    if(!formData.periodeStart) return;
                    const d = new Date(formData.periodeStart); d.setMonth(d.getMonth() + 1); d.setDate(d.getDate() - 1);
                    setFormData({...formData, periodeEnd: d.toISOString().split('T')[0]});
                  }} className="text-[10px] bg-white border border-[#DCC7AA] text-[#6F4E37] px-2 py-1.5 rounded-lg font-bold hover:bg-[#F5E6CA] transition-colors shadow-sm">1 Bulan</button>
                </div>
              </div>

              <div className="border-t border-[#DCC7AA]/50 pt-4 mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Gaji Pokok</label>
                  <input type="text" required placeholder="0" value={formData.pokok ? Number(formData.pokok).toLocaleString('id-ID') : ''} onChange={e => setFormData({...formData, pokok: e.target.value.replace(/\D/g, '')})} className="w-full border rounded-xl px-4 py-2 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7] text-right font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80 text-green-600">Tunjangan / Bonus</label>
                  <input type="text" placeholder="0" value={formData.bonus ? Number(formData.bonus).toLocaleString('id-ID') : ''} onChange={e => setFormData({...formData, bonus: e.target.value.replace(/\D/g, '')})} className="w-full border rounded-xl px-4 py-2 outline-none focus:border-green-300 bg-[#FFFDF7] text-right font-bold text-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80 text-red-600">Kasbon / Potongan</label>
                  <input type="text" placeholder="0" value={formData.potongan ? Number(formData.potongan).toLocaleString('id-ID') : ''} onChange={e => setFormData({...formData, potongan: e.target.value.replace(/\D/g, '')})} className="w-full border rounded-xl px-4 py-2 outline-none focus:border-red-300 bg-[#FFFDF7] text-right font-bold text-red-600" />
                </div>
              </div>

              <div className="bg-[#4B3832]/5 p-4 rounded-xl flex justify-between items-center mt-4 border border-[#4B3832]/10">
                <span className="font-bold text-[#4B3832]">Total Bersih</span>
                <span className="text-2xl font-black text-[#4B3832]">Rp {totalBersih.toLocaleString('id-ID')}</span>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border border-[#DCC7AA] text-[#6F4E37] py-3 rounded-xl font-bold hover:bg-[#F5E6CA] transition-colors">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-[#4B3832] text-white py-3 rounded-xl font-bold hover:bg-[#6F4E37] transition-colors disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Simpan & Bayar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetailModalData(null)}>
          <div className="bg-[#FFFDF7] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-[#DCC7AA]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#DCC7AA] flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-[#4B3832]">Rincian Gaji</h2>
              <button onClick={() => setDetailModalData(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center">&times;</button>
            </div>
            <div className="p-6 space-y-4 bg-white">
              {detailModalData.split('|').map((note, idx) => {
                const parts = note.split(':');
                const label = parts[0]?.trim();
                const value = parts[1]?.trim();
                
                return (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <span className={`text-sm ${label === 'Periode' ? 'font-bold text-gray-500' : 'font-bold text-gray-500 uppercase tracking-wider text-xs'}`}>{label}</span>
                    <span className={`text-sm font-black ${label === 'Kasbon / Potongan' ? 'text-red-600' : label === 'Tunjangan / Bonus' ? 'text-green-600' : 'text-[#4B3832]'}`}>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
