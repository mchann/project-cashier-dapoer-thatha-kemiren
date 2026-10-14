// src/lib/offline-db.ts
import { Category, Product, OrderItem } from '@/types/pos';

export interface OfflineTransaction {
  clientTxId: string;
  invoiceNumber: string;
  tableNumber: string;
  customerName: string;
  orderType: 'dine_in' | 'takeaway' | 'reservation' | 'qr_order';
  paymentStatus: 'paid' | 'unpaid' | 'dp_paid';
  paymentMethod: 'tunai' | 'qris';
  items: OrderItem[];
  subtotal: number;
  dpAmount: number;
  discountAmount: number;
  guideCommission: number;
  guideCode: string;
  guideName: string;
  isGuideOrder: boolean;
  isGuideRewardProcessed: boolean;
  grandTotal: number;
  amountReceived: number;
  changeAmount: number;
  cashierName: string;
  cashierId?: string;
  offlineCreatedAt: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  syncError?: string;
  syncedAt?: string;
}

const DB_NAME = 'dapoer_thatha_pos_offline';
const DB_VERSION = 1;

export function openPOSDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak tersedia di lingkungan ini'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Meta key-value store
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }

      // Categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: '_id' });
      }

      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const prodStore = db.createObjectStore('products', { keyPath: '_id' });
        prodStore.createIndex('categoryId', 'categoryId', { unique: false });
      }

      // Pending offline transactions
      if (!db.objectStoreNames.contains('offline_transactions')) {
        const txStore = db.createObjectStore('offline_transactions', { keyPath: 'clientTxId' });
        txStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        txStore.createIndex('offlineCreatedAt', 'offlineCreatedAt', { unique: false });
      }

      // Draft / offline faktur gantung
      if (!db.objectStoreNames.contains('offline_faktur')) {
        db.createObjectStore('offline_faktur', { keyPath: 'localId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Simpan Master Data (Menu, Kategori, Pengaturan) ---
export async function saveMasterDataToDB(data: {
  categories?: Category[];
  products?: Product[];
  receiptSettings?: any;
  cashierProfile?: { id?: string; name?: string; role?: string; username?: string };
}): Promise<void> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction(['meta', 'categories', 'products'], 'readwrite');

    const metaStore = tx.objectStore('meta');
    metaStore.put({ key: 'lastMasterSync', value: new Date().toISOString() });

    if (data.receiptSettings) {
      metaStore.put({ key: 'receiptSettings', value: data.receiptSettings });
    }

    if (data.cashierProfile) {
      metaStore.put({ key: 'cashierProfile', value: data.cashierProfile });
    }

    if (data.categories && data.categories.length > 0) {
      const catStore = tx.objectStore('categories');
      catStore.clear();
      data.categories.forEach(cat => catStore.put(cat));
    }

    if (data.products && data.products.length > 0) {
      const prodStore = tx.objectStore('products');
      prodStore.clear();
      data.products.forEach(p => prodStore.put(p));
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Gagal menyimpan master data ke IndexedDB:', err);
  }
}

// --- Ambil Cached Data ---
export async function getCachedCategories(): Promise<Category[]> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('categories', 'readonly');
    const store = tx.objectStore('categories');
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getCachedProducts(): Promise<Product[]> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getCachedMeta(key: string): Promise<any> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('meta', 'readonly');
    const store = tx.objectStore('meta');
    const request = store.get(key);

    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// --- Simpan Transaksi Offline ---
export async function saveOfflineTransaction(txData: Omit<OfflineTransaction, 'syncStatus'>): Promise<OfflineTransaction> {
  const db = await openPOSDB();
  const tx = db.transaction('offline_transactions', 'readwrite');
  const store = tx.objectStore('offline_transactions');

  const fullRecord: OfflineTransaction = {
    ...txData,
    syncStatus: 'pending'
  };

  store.put(fullRecord);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(fullRecord);
    tx.onerror = () => reject(tx.error);
  });
}

// --- Ambil Semua Transaksi Offline yang Belum Tersinkronkan ---
export async function getPendingOfflineTransactions(): Promise<OfflineTransaction[]> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const all = (request.result || []) as OfflineTransaction[];
        // Filter hanya yang belum lunas tersinkronkan
        const pending = all.filter(t => t.syncStatus !== 'synced');
        resolve(pending);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// --- Ambil Semua Transaksi Offline (Termasuk Riwayat Sinkron) ---
export async function getAllOfflineTransactions(): Promise<OfflineTransaction[]> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const all = (request.result || []) as OfflineTransaction[];
        // Sort descending by offlineCreatedAt
        all.sort((a, b) => new Date(b.offlineCreatedAt).getTime() - new Date(a.offlineCreatedAt).getTime());
        resolve(all);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// --- Update Status Sinkronisasi Transaksi ---
export async function updateOfflineTransactionStatus(
  clientTxId: string,
  status: 'pending' | 'syncing' | 'synced' | 'failed',
  error?: string
): Promise<void> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('offline_transactions', 'readwrite');
    const store = tx.objectStore('offline_transactions');
    const getReq = store.get(clientTxId);

    getReq.onsuccess = () => {
      if (getReq.result) {
        const item = getReq.result as OfflineTransaction;
        item.syncStatus = status;
        if (error !== undefined) item.syncError = error;
        if (status === 'synced') item.syncedAt = new Date().toISOString();
        store.put(item);
      }
    };

    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.error('Gagal memperbarui status transaksi offline:', err);
  }
}

// --- Hapus Transaksi yang Sudah Berhasil Disinkronkan ---
export async function clearSyncedOfflineTransactions(): Promise<void> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('offline_transactions', 'readwrite');
    const store = tx.objectStore('offline_transactions');
    const req = store.getAll();

    req.onsuccess = () => {
      const all = req.result as OfflineTransaction[];
      all.filter(t => t.syncStatus === 'synced').forEach(t => {
        store.delete(t.clientTxId);
      });
    };
  } catch (err) {
    console.error('Gagal membersihkan transaksi tersinkron:', err);
  }
}

// --- Statistik Antrean Offline ---
export async function getOfflineQueueStats(): Promise<{ pendingCount: number; failedCount: number; syncedCount: number }> {
  try {
    const db = await openPOSDB();
    const tx = db.transaction('offline_transactions', 'readonly');
    const store = tx.objectStore('offline_transactions');
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const all = (request.result || []) as OfflineTransaction[];
        resolve({
          pendingCount: all.filter(t => t.syncStatus === 'pending' || t.syncStatus === 'syncing').length,
          failedCount: all.filter(t => t.syncStatus === 'failed').length,
          syncedCount: all.filter(t => t.syncStatus === 'synced').length
        });
      };
      request.onerror = () => resolve({ pendingCount: 0, failedCount: 0, syncedCount: 0 });
    });
  } catch {
    return { pendingCount: 0, failedCount: 0, syncedCount: 0 };
  }
}
