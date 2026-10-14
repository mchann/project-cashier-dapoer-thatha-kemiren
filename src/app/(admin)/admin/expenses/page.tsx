// src/app/(admin)/admin/expenses/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
  
  // Settings State
  const [categories, setCategories] = useState<string[]>(['Bahan Baku', 'Operasional', 'Gaji', 'Lainnya']);
  const [units, setUnits] = useState<string[]>(['Kilogram (KG)', 'Gram (gr)', 'Liter (L)', 'Mililiter (ml)', 'Pcs / Buah', 'Ikat', 'Pack', 'Kardus / Dus']);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings Modal State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Filter & Pagination
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [colSearchTanggal, setColSearchTanggal] = useState('');
  const [colSearchKeterangan, setColSearchKeterangan] = useState('');
  const [colSearchKategori, setColSearchKategori] = useState('');
  const [colSearchNominal, setColSearchNominal] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [startDate, setStartDate] = useState<string>(''); 
  const [endDate, setEndDate] = useState<string>(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setFilterPreset = (preset: 'today' | 'thisMonth') => {
    const now = new Date();
    if (preset === 'today') {
      const today = now.toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    quantity: '1',
    unit: 'Kilogram (KG)',
    category: 'Bahan Baku',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resExpenses, resSettings] = await Promise.all([
        fetch('/api/admin/expenses'),
        fetch('/api/settings')
      ]);
      
      if (resExpenses.ok) {
        const data = await resExpenses.json();
        if(Array.isArray(data)) setExpenses(data);
      }
      
      if (resSettings.ok) {
        const settingsData = await resSettings.json();
        if (settingsData?.expenses?.categories?.length) {
          setCategories(settingsData.expenses.categories);
        }
        if (settingsData?.expenses?.units?.length) {
          setUnits(settingsData.expenses.units);
        }
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsSettingsModalOpen(false);
      }
    };
    if (isModalOpen || isDeleteModalOpen || isSettingsModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isDeleteModalOpen, isSettingsModalOpen]);

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
        setFormData({ title: '', amount: '', quantity: '1', unit: units[0] || 'KG', category: categories[0] || 'Bahan Baku', date: new Date().toISOString().split('T')[0], notes: '' });
        fetchData();
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
      unit: exp.unit || units[0] || 'KG',
      category: exp.category || categories[0] || 'Bahan Baku',
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
        fetchData();
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
      
      // 2. Tanggal
      let matchDate = true;
      if (startDate && endDate) {
        matchDate = e.date >= startDate && e.date <= endDate;
      } else if (startDate) {
        matchDate = e.date >= startDate;
      } else if (endDate) {
        matchDate = e.date <= endDate;
      }

      // 3. Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' || e.title.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q));

      // 4. Column Level Search
      let matchColTanggal = true;
      let matchColKeterangan = true;
      let matchColKategori = true;
      let matchColNominal = true;

      if (colSearchTanggal) {
        const dateStr = new Date(e.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}).toLowerCase();
        matchColTanggal = dateStr.includes(colSearchTanggal.toLowerCase());
      }
      if (colSearchKeterangan) {
        const titleStr = e.title.toLowerCase();
        const noteStr = (e.notes || '').toLowerCase();
        matchColKeterangan = titleStr.includes(colSearchKeterangan.toLowerCase()) || noteStr.includes(colSearchKeterangan.toLowerCase());
      }
      if (colSearchKategori) {
        const catStr = e.category.replace('_', ' ').toLowerCase();
        matchColKategori = catStr.includes(colSearchKategori.toLowerCase());
      }
      if (colSearchNominal) {
        const numStr = e.amount.toString();
        matchColNominal = numStr.includes(colSearchNominal);
      }

      return matchCategory && matchDate && matchSearch && matchColTanggal && matchColKeterangan && matchColKategori && matchColNominal;
    });
  }, [expenses, categoryFilter, startDate, endDate, searchQuery, colSearchTanggal, colSearchKeterangan, colSearchKategori, colSearchNominal]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, startDate, endDate, searchQuery, colSearchTanggal, colSearchKeterangan, colSearchKategori, colSearchNominal]);

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

  const exportToExcel = () => {
    const data = filteredExpenses.map((exp, index) => ({
      No: index + 1,
      Tanggal: new Date(exp.date).toLocaleDateString('id-ID'),
      Kategori: exp.category,
      Judul: exp.title,
      'Nominal (Rp)': exp.amount,
      Kuantitas: exp.quantity ? `${exp.quantity} ${exp.unit || ''}` : '-',
      Catatan: exp.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pengeluaran");
    XLSX.writeFile(workbook, `Laporan_Pengeluaran_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Pengeluaran Dapoer Thatha", 14, 15);
    
    const tableColumn = ["No", "Tanggal", "Kategori", "Judul", "Nominal", "Kuantitas", "Catatan"];
    const tableRows = filteredExpenses.map((exp, index) => [
      index + 1,
      new Date(exp.date).toLocaleDateString('id-ID'),
      exp.category,
      exp.title,
      `Rp ${exp.amount.toLocaleString('id-ID')}`,
      exp.quantity ? `${exp.quantity} ${exp.unit || ''}` : '-',
      exp.notes || '-'
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`Laporan_Pengeluaran_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4B3832]">Daftar Pengeluaran</h1>
          <p className="text-[#6F4E37] font-medium">Pantau total uang keluar dan operasional restoran.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button 
              type="button"
              onClick={() => setIsExportMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 bg-[#4B3832] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#6F4E37] transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Export
            </button>
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#DCC7AA] overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { exportToExcel(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-3">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM15.8 17H14v-2.2c0-.5-.1-1-.3-1.4l1.6-2h-1.8l-1.1 1.8c-.1.2-.2.5-.2.8h-.1c0-.3-.1-.5-.2-.8L10.8 11.4H9l1.6 2c-.2.4-.3.9-.3 1.4V17h-1.8v-6h1.8v2.2c0 .5.1 1 .3 1.4l1.1-1.8c.1-.2.2-.5.2-.8h.1c0 .3.1.5.2.8l1.1 1.8c.2.4.3.9.3 1.4V17z"/></svg>
                   Export Excel
                </button>
                <div className="h-px bg-gray-100"></div>
                <button onClick={() => { exportToPDF(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .8-.7 1.5-1.5 1.5H7v2H5.5V9H8c.8 0 1.5.7 1.5 1.5v1zm5 2c0 .8-.7 1.5-1.5 1.5h-2.5V9H13c.8 0 1.5.7 1.5 1.5v3zm4-3h-2v1.5h1.5v1.5H16.5V15H15V9h3.5v1.5zM7 10.5h1v1H7v-1zm6.5 0h1v3h-1v-3z"/></svg>
                   Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#DCC7AA] shadow-sm max-w-full overflow-x-auto scrollbar-hide">
            <button onClick={() => setFilterPreset('today')} className="text-xs font-bold px-3 py-2 hover:bg-[#F5E6CA] rounded-lg transition-colors">Hari Ini</button>
            <button onClick={() => setFilterPreset('thisMonth')} className="text-xs font-bold px-3 py-2 hover:bg-[#F5E6CA] rounded-lg transition-colors">Bulan Ini</button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="text-sm border-none outline-none bg-transparent font-medium"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="text-sm border-none outline-none bg-transparent font-medium"
            />
          </div>

          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="bg-white border border-[#DCC7AA] text-[#6F4E37] px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide hover:bg-[#F5E6CA] transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Kategori & Satuan
          </button>

          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', amount: '', quantity: '1', unit: 'KG', category: 'bahan_baku', date: new Date().toISOString().split('T')[0], notes: '' });
              setIsModalOpen(true);
            }}
            className="bg-[#4B3832] text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide hover:bg-[#6F4E37] transition-colors shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Catat Pengeluaran
          </button>
        </div>
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
              <button
                onClick={() => setCategoryFilter('semua')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${categoryFilter === 'semua' ? 'bg-[#4B3832] text-white shadow-md' : 'text-[#6F4E37] hover:bg-[#F5E6CA]'}`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-[#4B3832] text-white shadow-md' : 'text-[#6F4E37] hover:bg-[#F5E6CA]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FFFDF7] text-xs uppercase font-black text-[#6F4E37] border-b">
              <tr>
                <th className="px-6 py-4 text-center w-16">No</th>
                
                <th className="px-6 py-4 group">
                  <div className="flex items-center justify-between gap-2">
                    {activeSearch === 'tanggal' || colSearchTanggal ? (
                      <input autoFocus={activeSearch === 'tanggal'} type="text" placeholder="Cari..." className="w-full bg-white border border-[#DCC7AA] rounded px-2 py-1 text-xs font-normal text-gray-700 focus:outline-none" value={colSearchTanggal} onChange={e => setColSearchTanggal(e.target.value)} onBlur={() => setActiveSearch(null)} />
                    ) : (
                      <span className="cursor-pointer flex-1" onClick={() => setActiveSearch('tanggal')}>Tanggal</span>
                    )}
                    <button onClick={() => { if (colSearchTanggal || activeSearch === 'tanggal') { setColSearchTanggal(''); setActiveSearch(null); } else { setActiveSearch('tanggal'); } }} className="text-gray-400 hover:text-[#6F4E37] flex-shrink-0">
                      {colSearchTanggal || activeSearch === 'tanggal' ? (
                        <svg className="w-3.5 h-3.5 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      )}
                    </button>
                  </div>
                </th>

                <th className="px-6 py-4 group">
                  <div className="flex items-center justify-between gap-2">
                    {activeSearch === 'keterangan' || colSearchKeterangan ? (
                      <input autoFocus={activeSearch === 'keterangan'} type="text" placeholder="Cari ket..." className="w-full bg-white border border-[#DCC7AA] rounded px-2 py-1 text-xs font-normal text-gray-700 focus:outline-none" value={colSearchKeterangan} onChange={e => setColSearchKeterangan(e.target.value)} onBlur={() => setActiveSearch(null)} />
                    ) : (
                      <span className="cursor-pointer flex-1" onClick={() => setActiveSearch('keterangan')}>Keterangan</span>
                    )}
                    <button onClick={() => { if (colSearchKeterangan || activeSearch === 'keterangan') { setColSearchKeterangan(''); setActiveSearch(null); } else { setActiveSearch('keterangan'); } }} className="text-gray-400 hover:text-[#6F4E37] flex-shrink-0">
                      {colSearchKeterangan || activeSearch === 'keterangan' ? (
                        <svg className="w-3.5 h-3.5 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      )}
                    </button>
                  </div>
                </th>

                <th className="px-6 py-4 group">
                  <div className="flex items-center justify-between gap-2">
                    {activeSearch === 'kategori' || colSearchKategori ? (
                      <input autoFocus={activeSearch === 'kategori'} type="text" placeholder="Cari kategori..." className="w-full bg-white border border-[#DCC7AA] rounded px-2 py-1 text-xs font-normal text-gray-700 focus:outline-none" value={colSearchKategori} onChange={e => setColSearchKategori(e.target.value)} onBlur={() => setActiveSearch(null)} />
                    ) : (
                      <span className="cursor-pointer flex-1" onClick={() => setActiveSearch('kategori')}>Kategori</span>
                    )}
                    <button onClick={() => { if (colSearchKategori || activeSearch === 'kategori') { setColSearchKategori(''); setActiveSearch(null); } else { setActiveSearch('kategori'); } }} className="text-gray-400 hover:text-[#6F4E37] flex-shrink-0">
                      {colSearchKategori || activeSearch === 'kategori' ? (
                        <svg className="w-3.5 h-3.5 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      )}
                    </button>
                  </div>
                </th>

                <th className="px-6 py-4 group text-right">
                  <div className="flex items-center justify-end gap-2">
                    {activeSearch === 'nominal' || colSearchNominal ? (
                      <input autoFocus={activeSearch === 'nominal'} type="text" placeholder="Cari nom..." className="w-full max-w-[100px] bg-white border border-[#DCC7AA] rounded px-2 py-1 text-xs font-normal text-gray-700 focus:outline-none text-right" value={colSearchNominal} onChange={e => setColSearchNominal(e.target.value)} onBlur={() => setActiveSearch(null)} />
                    ) : (
                      <span className="cursor-pointer flex-1" onClick={() => setActiveSearch('nominal')}>Nominal</span>
                    )}
                    <button onClick={() => { if (colSearchNominal || activeSearch === 'nominal') { setColSearchNominal(''); setActiveSearch(null); } else { setActiveSearch('nominal'); } }} className="text-gray-400 hover:text-[#6F4E37] flex-shrink-0">
                      {colSearchNominal || activeSearch === 'nominal' ? (
                        <svg className="w-3.5 h-3.5 text-red-400 hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      )}
                    </button>
                  </div>
                </th>

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
                    {units.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
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
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-80">Kategori</label>
                </div>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:border-[#DCC7AA] bg-[#FFFDF7]"
                >
                  {categories
                    .filter(c => c.toLowerCase() !== 'gaji')
                    .map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
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
      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSettingsModalOpen(false)}
        >
          <div 
            className="bg-[#FFFDF7] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#DCC7AA]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#DCC7AA] bg-white flex justify-between items-center">
              <h2 className="text-xl font-black text-[#4B3832]">Kategori & Satuan</h2>
              <button onClick={() => setIsSettingsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">&times;</button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-8 bg-white">
              {/* Kategori */}
              <div>
                <h3 className="font-bold text-[#4B3832] mb-3">Daftar Kategori</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex items-center gap-1 bg-[#F5E6CA] text-[#6F4E37] px-3 py-1.5 rounded-lg text-sm font-bold">
                      {cat}
                      <button 
                        onClick={async () => {
                          const newCats = categories.filter((_, idx) => idx !== i);
                          setCategories(newCats);
                          await fetch('/api/settings', { method: 'PUT', body: JSON.stringify({ expenses: { categories: newCats, units } }) });
                          fetchData();
                        }}
                        className="ml-1 text-[#6F4E37]/50 hover:text-red-500"
                      >&times;</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" id="newCategory" placeholder="Kategori Baru..." className="flex-1 border border-[#DCC7AA] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4B3832]" />
                  <button 
                    onClick={async () => {
                      const input = document.getElementById('newCategory') as HTMLInputElement;
                      if (!input.value.trim()) return;
                      const newCats = [...categories, input.value.trim()];
                      setCategories(newCats);
                      await fetch('/api/settings', { method: 'PUT', body: JSON.stringify({ expenses: { categories: newCats, units } }) });
                      input.value = '';
                      fetchData();
                    }}
                    className="bg-[#4B3832] text-white px-4 py-2 rounded-xl text-sm font-bold"
                  >Tambah</button>
                </div>
              </div>

              {/* Satuan */}
              <div>
                <h3 className="font-bold text-[#4B3832] mb-3">Daftar Satuan Kuantitas</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {units.map((u, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                      {u}
                      <button 
                        onClick={async () => {
                          const newUnits = units.filter((_, idx) => idx !== i);
                          setUnits(newUnits);
                          await fetch('/api/settings', { method: 'PUT', body: JSON.stringify({ expenses: { categories, units: newUnits } }) });
                          fetchData();
                        }}
                        className="ml-1 text-gray-400 hover:text-red-500"
                      >&times;</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" id="newUnit" placeholder="Satuan Baru..." className="flex-1 border border-[#DCC7AA] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#4B3832]" />
                  <button 
                    onClick={async () => {
                      const input = document.getElementById('newUnit') as HTMLInputElement;
                      if (!input.value.trim()) return;
                      const newUnits = [...units, input.value.trim()];
                      setUnits(newUnits);
                      await fetch('/api/settings', { method: 'PUT', body: JSON.stringify({ expenses: { categories, units: newUnits } }) });
                      input.value = '';
                      fetchData();
                    }}
                    className="bg-[#4B3832] text-white px-4 py-2 rounded-xl text-sm font-bold"
                  >Tambah</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
