// src/components/pos/OfflineSyncModal.tsx
'use client';

import React, { useState } from 'react';
import { useOfflineSync } from '@/context/OfflineSyncContext';
import { clearSyncedOfflineTransactions } from '@/lib/offline-db';

export function OfflineSyncModal() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    failedCount,
    syncedCount,
    lastSyncTime,
    offlineTransactions,
    isOfflineModalOpen,
    setIsOfflineModalOpen,
    syncNow,
    refreshStats
  } = useOfflineSync();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOfflineModalOpen) return null;

  const handleSyncClick = async () => {
    setNotification({ message: 'Memulai proses sinkronisasi...', type: 'info' });
    const res = await syncNow();
    if (res.success) {
      setNotification({ message: res.message, type: 'success' });
    } else {
      setNotification({ message: res.message, type: 'error' });
    }
  };

  const handleClearHistory = async () => {
    await clearSyncedOfflineTransactions();
    await refreshStats();
    setNotification({ message: 'Riwayat transaksi yang sudah tersinkron telah dibersihkan.', type: 'info' });
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' (' + d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ')';
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={() => setIsOfflineModalOpen(false)}
    >
      <div 
        className="bg-[#FFFDF7] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#DCC7AA]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#4B3832] text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
            <div>
              <h2 className="font-extrabold text-lg flex items-center gap-2">
                Status Koneksi & Sinkronisasi Offline
              </h2>
              <p className="text-xs text-[#DCC7AA]">
                {isOnline ? 'Tersambung ke Cloud Server (Online)' : 'Mode Mandiri (Offline) - Transaksi tersimpan lokal'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOfflineModalOpen(false)}
            className="p-1 hover:bg-[#6F4E37] rounded-full transition-colors text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Notifikasi Status */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between ${
            notification.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
            notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="underline ml-4">Tutup</button>
          </div>
        )}

        {/* Summary Card */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Menunggu Sinkron</span>
              <span className="text-2xl font-black text-amber-900">{pendingCount}</span>
              <span className="text-[10px] text-amber-600 block mt-0.5">Transaksi tersimpan</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Tersinkronisasi</span>
              <span className="text-2xl font-black text-emerald-900">{syncedCount}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Sudah masuk cloud</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Gagal Sinkron</span>
              <span className="text-2xl font-black text-red-900">{failedCount}</span>
              <span className="text-[10px] text-red-600 block mt-0.5">Perlu dicoba lagi</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DCC7AA]/60 mb-2">
            <div className="text-xs">
              <span className="text-[#6F4E37] font-medium">Terakhir sinkron: </span>
              <span className="font-bold text-[#4B3832]">
                {lastSyncTime ? formatTime(lastSyncTime.toISOString()) : 'Belum pernah sinkron sesi ini'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {syncedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Bersihkan Riwayat
                </button>
              )}
              <button
                type="button"
                onClick={handleSyncClick}
                disabled={isSyncing || (!isOnline && pendingCount === 0)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all ${
                  isSyncing
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : pendingCount > 0 || failedCount > 0
                    ? 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSyncing ? 'Sedang Menyinkronkan...' : pendingCount > 0 ? `Sinkronkan ${pendingCount} Data Sekarang` : 'Periksa & Sinkronkan'}
              </button>
            </div>
          </div>
        </div>

        {/* Daftar Transaksi Offline */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F4E37] mb-2 flex items-center justify-between">
            <span>Daftar Transaksi Offline di Perangkat Ini</span>
            <span className="text-[10px] text-gray-400">Total: {offlineTransactions.length}</span>
          </h3>

          {offlineTransactions.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-[#DCC7AA]">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-xs font-bold text-gray-500">Tidak ada data transaksi offline.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Semua transaksi baru langsung tersimpan aman ke cloud saat online.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {offlineTransactions.map((tx) => (
                <div 
                  key={tx.clientTxId}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs bg-white ${
                    tx.syncStatus === 'synced'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : tx.syncStatus === 'failed'
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-amber-200 bg-amber-50/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#4B3832] truncate">{tx.invoiceNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#F5E6CA] text-[#6F4E37]">
                        Meja {tx.tableNumber || 'TA'}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate">({tx.customerName})</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{formatTime(tx.offlineCreatedAt)}</span>
                      <span>•</span>
                      <span>{tx.items?.length || 0} menu</span>
                      <span>•</span>
                      <span className="uppercase">{tx.paymentMethod}</span>
                    </div>
                    {tx.syncError && (
                      <div className="text-[10px] text-red-600 font-medium mt-1">
                        Pesan: {tx.syncError}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="font-black text-[#4B3832]">{formatRupiah(tx.grandTotal)}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      tx.syncStatus === 'synced'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tx.syncStatus === 'syncing'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : tx.syncStatus === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tx.syncStatus === 'synced' ? 'Tersinkron' :
                       tx.syncStatus === 'syncing' ? 'Menyinkron...' :
                       tx.syncStatus === 'failed' ? 'Gagal' : 'Menunggu Sinkron'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security & Integrity Note */}
          <div className="mt-4 p-3 bg-[#F5E6CA]/50 rounded-xl border border-[#DCC7AA] text-[11px] text-[#6F4E37] flex items-start gap-2.5">
            <svg className="w-4 h-4 text-[#4B3832] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <div>
              <span className="font-bold text-[#4B3832] block">Keamanan & Integritas Data Terjamin:</span>
              Transaksi offline terlindungi enkripsi memori lokal per-kasir dan divalidasi dengan kunci unik anti-duplikasi (*Idempotency Key*). Transaksi tidak akan pernah tercatat ganda di cloud database.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
