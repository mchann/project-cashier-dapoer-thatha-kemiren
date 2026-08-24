// src/app/(admin)/admin/expenses/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  quantity?: number;
  unit?: string;
  category: string;
  notes: string;
  date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter & Pagination
  const [viewMode, setViewMode] = useState<'today' | 'month' | 'range' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [startDate, setStartDate] = useState<string>(''); 
  const [endDate, setEndDate] = useState<string>(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    quantity: '1',
    unit: 'KG',
    category: 'bahan_baku',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/expenses');
      const data = await res.json();
      if(Array.isArray(data)) setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    };
    if (isModalOpen || isDeleteModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isDeleteModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    setIsSaving(true);
    try {
      // Remove any non-digit characters to get the raw number
      const rawAmount = parseInt(formData.amount.replace(/\D/g, ''), 10);
      const submitData = { ...formData, amount: rawAmount };

      const url = editingId ? `/api/admin/expenses/${editingId}` : '/api/admin/expenses';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ title: '', amount: '', quantity: '1', unit: 'KG', category: 'bahan_baku', date: new Date().toISOString().split('T')[0], notes: '' });
        fetchExpenses();
      } else {
        alert('Gagal menyimpan pengeluaran');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditClick = (exp: any) => {
    setEditingId(exp._id);
    setFormData({
      title: exp.title,
      amount: exp.amount.toString(),
      quantity: exp.quantity ? exp.quantity.toString() : '1',
      unit: exp.unit || 'KG',
      category: exp.category,
      date: new Date(exp.date).toISOString().split('T')[0],
      notes: exp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (exp: any) => {
    setExpenseToDelete(exp);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      const res = await fetch(`/api/admin/expenses/${expenseToDelete._id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setExpenseToDelete(null);
        fetchExpenses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Filter Data
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // 1. Kategori
      const matchCategory = categoryFilter === 'semua' || e.category === categoryFilter;
      
      // 2. Tanggal & ViewMode
      let matchDate = true;
      if (viewMode === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        matchDate = e.date.startsWith(todayStr);
      } else if (viewMode === 'month') {
        const monthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
        matchDate = e.date.startsWith(monthStr);
      } else if (viewMode === 'range') {
        if (startDate && endDate) {
          matchDate = e.date >= startDate && e.date <= endDate;
        } else if (startDate) {
          matchDate = e.date >= startDate;
        } else if (endDate) {
          matchDate = e.date <= endDate;
        }
      }

      // 3. Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' || e.title.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q));

      return matchCategory && matchDate && matchSearch;
    });
  }, [expenses, categoryFilter, dateFilter, viewMode, searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, startDate, endDate, viewMode, searchQuery]);

  // Paginate Data
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredExpenses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredExpenses, currentPage]);
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE) || 1;

  // Menghitung Total Pengeluaran berdasarkan Filter
  const filteredTotalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  return (
    <div className="p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4B3832]">Daftar Pengeluaran</h1>
          <p className="text-[#6F4E37] font-medium">Pantau total uang keluar dan operasional restoran.</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', amount: '', quantity: '1', unit: 'KG', category: 'bahan_baku', date: new Date().toISOString().split('T')[0], notes: '' });
            setIsModalOpen(true);
          }}
          className="bg-[#4B3832] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-[#6F4E37] transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Catat Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 group-hover:scale-110 transition-transform"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Total Sesuai Filter</p>
           <h3 className="text-4xl font-black text-red-600 relative z-10">Rp {filteredTotalAmount.toLocaleString('id-ID')}</h3>
           <p className="text-xs font-medium text-gray-400 mt-2 relative z-10">Total nominal dari data yang ditampilkan di bawah</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-gray-500 group-hover:scale-110 transition-transform"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Jumlah Item Transaksi</p>
           <h3 className="text-4xl font-black text-gray-700 relative z-10">{filteredExpenses.length} Item</h3>
           <p className="text-xs font-medium text-gray-400 mt-2 relative z-10">Banyaknya catatan pengeluaran sesuai filter</p>
        </div>
      </div>

      {/* Filter & Table Header */}
      <div className="bg-white rounded-3xl border border-[#DCC7AA] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#DCC7AA] flex flex-col gap-4">
          <h2 className="text-lg font-bold">Riwayat Pengeluaran (Terbaru)</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
            
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl shadow-inner shrink-0 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setViewMode('today')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-black whitespace-nowrap transition-all ${viewMode === 'today' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Hari Ini
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-black whitespace-nowrap transition-all ${viewMode === 'month' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Bulan Ini
              </button>
              <button 
                onClick={() => setViewMode('range')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-black whitespace-nowrap transition-all ${viewMode === 'range' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Rentang Waktu
              </button>
              <button 
                onClick={() => setViewMode('all')}
                className={`flex-none px-4 py-2 rounded-lg text-sm font-black whitespace-nowrap transition-all ${viewMode === 'all' ? 'bg-white text-[#4B3832] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Semua
              </button>
            </div>

            {/* Pencarian */}
            <div className="relative w-full md:w-64 shrink-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                type="text"
                placeholder="Cari pengeluaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl pl-9 pr-4 py-2 text-sm font-bold text-[#4B3832] focus:outline-none focus:border-[#4B3832]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter Tabs Category */}
            <div className="flex gap-2 bg-[#FFFDF7] p-1.5 rounded-2xl border border-[#DCC7AA] shadow-sm overflow-x-auto w-full md:w-auto">
              {['semua', 'bahan_baku', 'operasional', 'gaji', 'lainnya'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-[#4B3832] text-white shadow-md' : 'text-[#6F4E37] hover:bg-[#F5E6CA]'}`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Filter Tanggal Khusus (Jika View Mode = Range) */}
            {viewMode === 'range' && (
              <div className="flex items-center gap-2 w-full md:w-auto bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl px-4 py-1.5 shadow-sm">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-sm text-[#4B3832]"
                />
                <span className="text-[#6F4E37] font-bold text-xs">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-sm text-[#4B3832]"
                />
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFFDF7] text-xs uppercase font-black text-[#6F4E37] border-b">
              <tr>
                <th className="px-6 py-4 text-center w-16">No</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Nominal</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Belum ada data pengeluaran sesuai filter</td></tr>
              ) : (
                paginatedExpenses.map((expense, index) => (
                  <tr key={expense._id} className="hover:bg-[#FFFDF7]/50 transition-colors">
                    <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-6 py-4">
                      {new Date(expense.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {expense.title}
                      {expense.quantity && expense.unit && (
                        <span className="ml-2 text-xs text-gray-500 font-medium">({expense.quantity} {expense.unit})</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold uppercase">{expense.category.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-red-600 font-black">
                      - Rp {expense.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEditClick(expense)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button onClick={() => handleDeleteClick(expense)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[#DCC7AA]/40">
            <p className="text-sm font-bold text-[#6F4E37]">
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredExpenses.length)} dari {filteredExpenses.length} item
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-[#DCC7AA] rounded-xl text-sm font-bold text-[#4B3832] disabled:opacity-50 hover:bg-[#F5E6CA] transition-colors"
              >
                Sebelumnya
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-[#DCC7AA] rounded-xl text-sm font-bold text-[#4B3832] disabled:opacity-50 hover:bg-[#F5E6CA] transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL INPUT PENGELUARAN */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-[#FFFDF7] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#DCC7AA] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#DCC7AA] flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-[#4B3832]">Catat Pengeluaran</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nama Belanja / Keperluan</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Cth: Beli Sayur & Ayam"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Kuantitas & Satuan</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                    min={0.1}
                    step="any"
                    placeholder="Banyaknya"
                    className="w-1/2 border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" 
                  />
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-1/2 border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]"
                  >
                    <option value="KG">Kilogram (KG)</option>
                    <option value="Gram">Gram (gr)</option>
                    <option value="Liter">Liter (L)</option>
                    <option value="ML">Mililiter (ml)</option>
                    <option value="Pcs">Pcs / Buah</option>
                    <option value="Ikat">Ikat</option>
                    <option value="Pack">Pack</option>
                    <option value="Dus">Kardus / Dus</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nominal (Rp)</label>
                <input 
                  type="text" 
                  value={formData.amount ? Number(formData.amount).toLocaleString('id-ID') : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, amount: rawValue});
                  }}
                  required
                  placeholder="Contoh: 150.000"
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Kategori</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]"
                >
                  <option value="bahan_baku">Bahan Baku (Pasar)</option>
                  <option value="operasional">Operasional (Listrik, Gas)</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Tanggal</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-[#DCC7AA] text-[#6F4E37] py-3 rounded-xl font-bold hover:bg-[#F5E6CA] transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-[#4B3832] text-white py-3 rounded-xl font-bold hover:bg-[#6F4E37] transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => { setIsDeleteModalOpen(false); setExpenseToDelete(null); }}
        >
          <div 
            className="bg-[#FFFDF7] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#DCC7AA] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-[#4B3832] mb-2">Hapus Pengeluaran?</h3>
              <p className="text-sm text-[#6F4E37] font-medium mb-6">
                Apakah Anda yakin ingin menghapus data <strong>{expenseToDelete?.title}</strong> senilai Rp {expenseToDelete?.amount?.toLocaleString('id-ID')}? Data yang dihapus tidak akan muncul di laporan.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setExpenseToDelete(null); }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-600/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
