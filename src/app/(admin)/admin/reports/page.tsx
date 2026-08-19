// src/app/(admin)/admin/reports/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionModal } from '@/components/admin/TransactionModal';

interface SummaryData {
  totalTransactions: number;
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [activeTab, setActiveTab] = useState<'transactions' | 'expenses'>('transactions');

  const [trxPage, setTrxPage] = useState(1);
  const [expPage, setExpPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setTrxPage(1);
    setExpPage(1);
  }, [startDate, endDate]);

  const paginatedTransactions = useMemo(() => {
    const start = (trxPage - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [transactions, trxPage]);
  const totalTrxPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1;

  const paginatedExpenses = useMemo(() => {
    const start = (expPage - 1) * ITEMS_PER_PAGE;
    return expenses.slice(start, start + ITEMS_PER_PAGE);
  }, [expenses, expPage]);
  const totalExpPages = Math.ceil(expenses.length / ITEMS_PER_PAGE) || 1;

  
  // Modal for Transaction Details
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setSummary(data.summary);
      setTransactions(data.transactions || []);
      setExpenses(data.expenses || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const exportToExcel = () => {
    const trxData = transactions.map(t => ({
      Waktu: new Date(t.createdAt).toLocaleString('id-ID'),
      Invoice: t.invoiceNumber,
      Tipe: t.orderType,
      Meja: t.tableNumber || '-',
      Pelanggan: t.customerName,
      Kasir: t.cashierName || '-',
      Subtotal: t.subtotal,
      'Potongan DP': t.dpAmount || 0,
      'Komisi Guide': t.guideCommission || 0,
      'Grand Total': t.grandTotal
    }));

    const expData = expenses.map(e => ({
      Tanggal: new Date(e.date).toLocaleDateString('id-ID'),
      Keterangan: e.quantity && e.unit ? `${e.title} (${e.quantity} ${e.unit})` : e.title,
      Kategori: e.category,
      Nominal: e.amount
    }));

    const wb = XLSX.utils.book_new();
    const wsTrx = XLSX.utils.json_to_sheet(trxData);
    const wsExp = XLSX.utils.json_to_sheet(expData);

    XLSX.utils.book_append_sheet(wb, wsTrx, 'Pemasukan');
    XLSX.utils.book_append_sheet(wb, wsExp, 'Pengeluaran');

    XLSX.writeFile(wb, `Laporan_Dapoer_Thatha_${startDate}_sd_${endDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(18);
    doc.text('Laporan Keuangan Dapoer Thatha', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 30);
    
    doc.text(`Total Pemasukan : Rp ${summary?.totalRevenue.toLocaleString('id-ID')}`, 14, 40);
    doc.text(`Total Pengeluaran: Rp ${summary?.totalExpense.toLocaleString('id-ID')}`, 14, 46);
    doc.text(`Laba Bersih     : Rp ${summary?.netProfit.toLocaleString('id-ID')}`, 14, 52);

    let finalY = 60;

    doc.setFontSize(14);
    doc.text('Data Transaksi (Pemasukan)', 14, finalY);
    
    const trxBody = transactions.map(t => [
      new Date(t.createdAt).toLocaleString('id-ID', { dateStyle:'short', timeStyle:'short' }),
      t.invoiceNumber,
      t.orderType.replace('_', ' '),
      t.customerName,
      `Rp ${t.subtotal.toLocaleString('id-ID')}`,
      `Rp ${(t.dpAmount || 0).toLocaleString('id-ID')}`,
      `Rp ${(t.guideCommission || 0).toLocaleString('id-ID')}`,
      `Rp ${t.grandTotal.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Waktu', 'Invoice', 'Tipe', 'Pelanggan', 'Subtotal', 'Potongan DP', 'Komisi Guide', 'Grand Total']],
      body: trxBody,
      theme: 'grid',
      headStyles: { fillColor: [75, 56, 50] } 
    });

    finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.text('Data Belanja (Pengeluaran)', 14, finalY);

    const expBody = expenses.map(e => [
      new Date(e.date).toLocaleDateString('id-ID', { dateStyle: 'short' }),
      e.quantity && e.unit ? `${e.title} (${e.quantity} ${e.unit})` : e.title,
      e.category,
      `Rp ${e.amount.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Tanggal', 'Keterangan', 'Kategori', 'Nominal']],
      body: expBody,
      theme: 'grid',
      headStyles: { fillColor: [75, 56, 50] }
    });

    doc.save(`Laporan_Dapoer_Thatha_${startDate}_sd_${endDate}.pdf`);
  };

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

  return (
    <div className="p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4B3832]">Laporan Keuangan</h1>
          <p className="text-[#6F4E37] font-medium">Ringkasan Laba Bersih berdasarkan Pemasukan & Pengeluaran</p>
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
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 group-hover:scale-110 transition-transform"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Total Pemasukan</p>
           <h3 className="text-3xl font-black text-emerald-600 relative z-10">Rp {summary?.totalRevenue.toLocaleString('id-ID') || 0}</h3>
           <p className="text-xs font-medium text-gray-400 mt-2 relative z-10">Dari {summary?.totalTransactions || 0} Transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-red-500 group-hover:scale-110 transition-transform"><svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg></div>
           <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 relative z-10">Total Pengeluaran</p>
           <h3 className="text-3xl font-black text-red-600 relative z-10">Rp {summary?.totalExpense.toLocaleString('id-ID') || 0}</h3>
           <p className="text-xs font-medium text-gray-400 mt-2 relative z-10">Belanja & Operasional</p>
        </div>

        <div className={`p-6 rounded-3xl border shadow-md relative overflow-hidden group ${(summary?.netProfit || 0) >= 0 ? 'bg-amber-500 border-amber-600 text-white' : 'bg-red-50 border-red-200 text-red-900'}`}>
           <p className="text-sm font-bold opacity-80 uppercase tracking-wider mb-2 relative z-10">Laba Bersih</p>
           <h3 className="text-4xl font-black relative z-10">Rp {(summary?.netProfit || 0).toLocaleString('id-ID')}</h3>
           <p className="text-xs font-medium opacity-80 mt-2 relative z-10">Pendapatan - Pengeluaran</p>
        </div>
      </div>

      {/* Tabs for Details */}
      <div className="bg-white rounded-3xl border border-[#DCC7AA] overflow-hidden shadow-sm">
        <div className="flex border-b border-[#DCC7AA]">
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-4 text-sm font-black tracking-widest uppercase transition-colors ${activeTab === 'transactions' ? 'bg-[#FFFDF7] text-[#4B3832] border-b-2 border-[#4B3832]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            Data Transaksi (Pemasukan)
          </button>
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-4 text-sm font-black tracking-widest uppercase transition-colors ${activeTab === 'expenses' ? 'bg-[#FFFDF7] text-[#4B3832] border-b-2 border-[#4B3832]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            Data Belanja (Pengeluaran)
          </button>
        </div>

        <div className="p-0 overflow-x-auto">
          {activeTab === 'transactions' && (
            <>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFFDF7] text-xs uppercase font-black text-[#6F4E37] border-b border-[#DCC7AA]">
                <tr>
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Tipe & Meja</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Kasir</th>
                  <th className="px-6 py-4 text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Tidak ada transaksi di rentang tanggal ini.</td></tr>
                ) : (
                  paginatedTransactions.map((t, index) => (
                    <tr 
                      key={t._id} 
                      onClick={() => setSelectedTransaction(t)}
                      className="hover:bg-[#FFFDF7]/60 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">{(trxPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td className="px-6 py-4 text-xs">{new Date(t.createdAt).toLocaleString('id-ID', {dateStyle:'medium', timeStyle:'short'})}</td>
                      <td className="px-6 py-4 font-bold text-[#4B3832]">{t.invoiceNumber}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold uppercase">{t.orderType.replace('_', ' ')}</span>
                            {t.tableNumber && <span className="font-bold text-xs text-gray-500">#{t.tableNumber}</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4">{t.customerName}</td>
                      <td className="px-6 py-4 text-xs">{t.cashierName || '-'}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">Rp {t.grandTotal.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination Transaksi */}
            {totalTrxPages > 1 && (
              <div className="p-4 border-t border-[#DCC7AA] flex items-center justify-between bg-white">
                <span className="text-sm text-gray-500 font-medium">Halaman {trxPage} dari {totalTrxPages}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={trxPage === 1} 
                    onClick={() => setTrxPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-[#DCC7AA] rounded-lg text-sm font-bold text-[#4B3832] hover:bg-[#F5E6CA] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Prev
                  </button>
                  <button 
                    disabled={trxPage === totalTrxPages} 
                    onClick={() => setTrxPage(p => Math.min(totalTrxPages, p + 1))}
                    className="px-4 py-2 border border-[#DCC7AA] rounded-lg text-sm font-bold text-[#4B3832] hover:bg-[#F5E6CA] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}

          {activeTab === 'expenses' && (
            <>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFFDF7] text-xs uppercase font-black text-[#6F4E37] border-b border-[#DCC7AA]">
                <tr>
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4 text-right">Nominal Pengeluaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Tidak ada pengeluaran di rentang tanggal ini.</td></tr>
                ) : (
                  paginatedExpenses.map((e, index) => (
                    <tr key={e._id} className="hover:bg-[#FFFDF7]/60 transition-colors">
                      <td className="px-6 py-4 text-center text-xs font-bold text-gray-500">{(expPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td className="px-6 py-4 text-xs">{new Date(e.date).toLocaleDateString('id-ID', {dateStyle:'medium'})}</td>
                      <td className="px-6 py-4 font-bold text-[#4B3832]">
                        {e.title}
                        {e.quantity && e.unit && (
                          <span className="ml-2 text-xs text-gray-500 font-medium">({e.quantity} {e.unit})</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold uppercase">{e.category.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-red-600">- Rp {e.amount.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination Pengeluaran */}
            {totalExpPages > 1 && (
              <div className="p-4 border-t border-[#DCC7AA] flex items-center justify-between bg-white">
                <span className="text-sm text-gray-500 font-medium">Halaman {expPage} dari {totalExpPages}</span>
                <div className="flex gap-2">
                  <button 
                    disabled={expPage === 1} 
                    onClick={() => setExpPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-[#DCC7AA] rounded-lg text-sm font-bold text-[#4B3832] hover:bg-[#F5E6CA] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Prev
                  </button>
                  <button 
                    disabled={expPage === totalExpPages} 
                    onClick={() => setExpPage(p => Math.min(totalExpPages, p + 1))}
                    className="px-4 py-2 border border-[#DCC7AA] rounded-lg text-sm font-bold text-[#4B3832] hover:bg-[#F5E6CA] disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionModal 
        transaction={selectedTransaction} 
        isOpen={!!selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </div>
  );
}
