// src/context/OfflineSyncContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  OfflineTransaction,
  saveOfflineTransaction,
  getPendingOfflineTransactions,
  getAllOfflineTransactions,
  updateOfflineTransactionStatus,
  getOfflineQueueStats,
  clearSyncedOfflineTransactions
} from '@/lib/offline-db';

interface OfflineSyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  syncedCount: number;
  lastSyncTime: Date | null;
  offlineTransactions: OfflineTransaction[];
  isOfflineModalOpen: boolean;
  setIsOfflineModalOpen: (open: boolean) => void;
  syncNow: () => Promise<{ success: boolean; syncedCount: number; message: string }>;
  recordOfflineTransaction: (tx: Omit<OfflineTransaction, 'syncStatus'>) => Promise<OfflineTransaction>;
  refreshStats: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [offlineTransactions, setOfflineTransactions] = useState<OfflineTransaction[]>([]);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);

  // Periksa koneksi nyata dengan ping ringan
  const verifyRealConnection = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return true;
    if (!navigator.onLine) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('/favicon.ico?_t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return res.ok || res.status === 200 || res.status === 304;
    } catch {
      return false;
    }
  }, []);

  // Perbarui data antrean dari IndexedDB
  const refreshStats = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const stats = await getOfflineQueueStats();
      setPendingCount(stats.pendingCount);
      setFailedCount(stats.failedCount);
      setSyncedCount(stats.syncedCount);

      const all = await getAllOfflineTransactions();
      setOfflineTransactions(all);
    } catch (err) {
      console.error('Gagal memperbarui statistik antrean offline:', err);
    }
  }, []);

  // Fungsi Sinkronisasi Data ke Server Cloud
  const syncNow = useCallback(async (): Promise<{ success: boolean; syncedCount: number; message: string }> => {
    if (isSyncing) {
      return { success: false, syncedCount: 0, message: 'Sinkronisasi sedang berlangsung...' };
    }

    const online = await verifyRealConnection();
    if (!online) {
      setIsOnline(false);
      return { success: false, syncedCount: 0, message: 'Tidak dapat tersambung ke server. Periksa koneksi internet.' };
    }
    setIsOnline(true);

    const pending = await getPendingOfflineTransactions();
    if (pending.length === 0) {
      return { success: true, syncedCount: 0, message: 'Tidak ada transaksi yang perlu disinkronkan.' };
    }

    setIsSyncing(true);

    try {
      // Tandai semua sebagai 'syncing'
      for (const tx of pending) {
        await updateOfflineTransactionStatus(tx.clientTxId, 'syncing');
      }
      await refreshStats();

      // Kirim batch transaksi ke endpoint server
      const res = await fetch('/api/pos/transactions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: pending })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim data sinkronisasi ke server');
      }

      let successCount = 0;
      if (Array.isArray(data.results)) {
        for (const r of data.results) {
          if (r.status === 'synced') {
            await updateOfflineTransactionStatus(r.clientTxId, 'synced');
            successCount++;
          } else {
            await updateOfflineTransactionStatus(r.clientTxId, 'failed', r.error || 'Gagal sinkron');
          }
        }
      }

      setLastSyncTime(new Date());
      await refreshStats();

      return {
        success: true,
        syncedCount: successCount,
        message: `${successCount} transaksi offline berhasil disinkronkan ke cloud.`
      };

    } catch (err: any) {
      console.error('Error saat sinkronisasi:', err);
      // Kembalikan status ke failed / pending
      for (const tx of pending) {
        await updateOfflineTransactionStatus(tx.clientTxId, 'failed', err.message);
      }
      await refreshStats();
      return {
        success: false,
        syncedCount: 0,
        message: err.message || 'Gagal menyinkronkan data ke server'
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, verifyRealConnection, refreshStats]);

  // Simpan transaksi offline baru
  const recordOfflineTransaction = useCallback(async (
    txData: Omit<OfflineTransaction, 'syncStatus'>
  ): Promise<OfflineTransaction> => {
    const saved = await saveOfflineTransaction(txData);
    await refreshStats();

    // Jika online, coba auto-sync langsung
    if (navigator.onLine) {
      syncNow().catch(() => {});
    }

    return saved;
  }, [refreshStats, syncNow]);

  // Listener event browser online & offline
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      const realOnline = await verifyRealConnection();
      setIsOnline(realOnline);
      if (realOnline) {
        // Auto-sync saat kembali online
        const stats = await getOfflineQueueStats();
        if (stats.pendingCount > 0 || stats.failedCount > 0) {
          syncNow();
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);
    verifyRealConnection().then(setIsOnline);
    refreshStats();

    // Periodic check setiap 30 detik untuk mendeteksi auto-recovery koneksi
    const intervalId = setInterval(async () => {
      const current = await verifyRealConnection();
      setIsOnline(current);
      if (current) {
        const stats = await getOfflineQueueStats();
        if (stats.pendingCount > 0) {
          syncNow();
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [verifyRealConnection, refreshStats, syncNow]);

  return (
    <OfflineSyncContext.Provider
      value={{
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
        recordOfflineTransaction,
        refreshStats
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync harus digunakan di dalam OfflineSyncProvider');
  }
  return context;
}
