// src/app/(staff)/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, OrderItem, Order, Category } from '@/types/pos';
import { AppliedGuideVoucher } from '@/components/pos/TravelPartnerSelector';

import { POSHeader } from '@/components/pos/POSHeader';
import { POSSidebar } from '@/components/pos/POSSidebar';
import { PrinterSettingsModal } from '@/components/pos/PrinterSettingsModal';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderCart } from '@/components/pos/OrderCart';
import { FakturGantungModal } from '@/components/pos/FakturGantungModal';
import { VoidPinModal } from '@/components/pos/VoidPinModal';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { TarikReservasiModal } from '@/components/pos/TarikReservasiModal';
import { OfflineSyncModal } from '@/components/pos/OfflineSyncModal';
import { useOfflineSync } from '@/context/OfflineSyncContext';
import { saveMasterDataToDB, getCachedCategories, getCachedProducts } from '@/lib/offline-db';
import { useSession } from 'next-auth/react';
import { Command } from 'lucide-react';

export default function POSPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const { isOnline, recordOfflineTransaction } = useOfflineSync();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // --- State Filter Kategori & Pencarian ---
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pullCode, setPullCode] = useState<string>('');
  const [isPulling, setIsPulling] = useState<boolean>(false);

  // --- State Keranjang Pesanan ---
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'reservation'>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'save_faktur'>('pay_now');
  const [dpAmount, setDpAmount] = useState<number>(0);

  // --- State Mitra Travel / Guide ---
  const [guideVoucher, setGuideVoucher] = useState<AppliedGuideVoucher | null>(null);
  const [guideInfo, setGuideInfo] = useState({ isGuideOrder: false, guideName: '' });

  // --- State Modals ---
  const [isFakturModalOpen, setIsFakturModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isTarikReservasiModalOpen, setIsTarikReservasiModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Order | null>(null);

  // Derivasi data pesanan (Aktif)
  const [fakturOrders, setFakturOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({ revenueToday: 0, transactionsCount: 0 });

  // --- State Notifikasi Aksi Kasir (A11y Alert) ---
  const [notifMessage, setNotifMessage] = useState<string>('');

  const showNotification = useCallback((msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => {
      setNotifMessage('');
    }, 4000);
  }, []);

  // --- Data dari Database ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = useCallback(async () => {
    let fetchedCats: Category[] = [];
    let fetchedProds: Product[] = [];

    try {
      const resCat = await fetch('/api/admin/categories');
      if (resCat.ok) {
        const dataCat = await resCat.json();
        fetchedCats = [
          { _id: 'cat-all', name: 'Semua Menu', slug: 'all' },
          ...dataCat
        ];
        setCategories(fetchedCats);
      }

      const resProd = await fetch('/api/admin/products');
      if (resProd.ok) {
        const dataProd = await resProd.json();
        const formattedProd = dataProd.map((p: any) => ({
          ...p,
          categoryId: p.categoryId?._id || p.categoryId,
          category: p.categoryId?._id ? p.categoryId : undefined
        })).filter((p: any) => p.isAvailable !== false);
        fetchedProds = formattedProd;
        setProducts(formattedProd);
      }

      const resPending = await fetch('/api/pos/transactions/pending');
      if (resPending.ok) {
        const dataPending = await resPending.json();
        setFakturOrders(dataPending);
      }

      const resStats = await fetch('/api/admin/dashboard');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setDashboardStats({ revenueToday: dataStats.revenueToday, transactionsCount: dataStats.transactionsCount });
      }

      // Simpan master data ke IndexedDB untuk cadangan offline
      if (fetchedCats.length > 0 || fetchedProds.length > 0) {
        saveMasterDataToDB({
          categories: fetchedCats,
          products: fetchedProds,
          cashierProfile: session?.user ? {
            id: session.user.id,
            name: session.user.name || undefined,
            role: session.user.role || undefined,
            username: session.user.username || undefined
          } : undefined
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Network offline / gagal fetch data, memuat dari memori lokal IndexedDB...', err);
      // Fallback: muat dari IndexedDB lokal
      const cachedCats = await getCachedCategories();
      const cachedProds = await getCachedProducts();
      if (cachedCats.length > 0) {
        setCategories(cachedCats);
      }
      if (cachedProds.length > 0) {
        setProducts(cachedProds);
      }
      showNotification('Mode Offline: Berhasil memuat daftar menu dari memori lokal perangkat.');
    }
  }, [session, showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

    // --- Hitung Jumlah Menu per Kategori ---
  const menuCounts = useMemo(() => {
    const counts: Record<string, number> = { 'cat-all': products.length };
    products.forEach((p) => {
      const catId = p.categoryId;
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // --- Filter Produk berdasarkan Kategori & Pencarian ---
  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (activeCategorySlug !== 'all') {
      const cat = categories.find((c) => c.slug === activeCategorySlug);
      if (cat) {
        result = result.filter((p) => p.categoryId === cat._id);
      }
    }
    
    if (searchTerm.trim() !== '') {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(lowerQuery));
    }
    
    return result;
  }, [activeCategorySlug, searchTerm, products, categories]);

  // --- Handler Tambah Menu ke Keranjang ---
  const handleAddToCart = useCallback((product: Product) => {
    const isLinked = !!product.rawMaterialId;
    const rmStock = isLinked ? (product.rawMaterialId as any)?.stock : 0;
    const isOutOfStock = !product.isUnlimited && (!isLinked || rmStock <= 0);

    if (isOutOfStock) return;

    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.productId === product._id);
      if (idx > -1) {
        if (!product.isUnlimited) {
          const currentQtyInCart = prev[idx].quantity;
          if (!isLinked || currentQtyInCart + 1 > rmStock) {
            showNotification(`Stok ${product.name} tidak mencukupi (sisa ${rmStock})`);
            return prev;
          }
        }
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  // --- Handler Ubah Kuantitas Item di Keranjang ---
  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setCartItems((prev) => {
      const itemIndex = prev.findIndex(i => i.productId === productId);
      if (itemIndex === -1) return prev;
      
      const item = prev[itemIndex];
      const nextQty = item.quantity + delta;
      
      if (nextQty <= 0) {
        return prev.filter((i) => i.productId !== productId);
      }
      
      // Validasi batas stok maksimum
      const product = products.find(p => p._id === productId);
      if (product && !product.isUnlimited) {
        const isLinked = !!product.rawMaterialId;
        const rmStock = isLinked ? (product.rawMaterialId as any)?.stock : 0;
        const currentQtyInCart = nextQty; // Since this is a single item, in a real scenario we'd sum all cart items sharing the same RM, but this is a good approximation for a single item change.
        if (!isLinked || currentQtyInCart > rmStock) {
          showNotification(`Stok ${product.name} tidak mencukupi (sisa ${rmStock})`);
          return prev;
        }
      }
      
      const updated = [...prev];
      updated[itemIndex] = { ...item, quantity: nextQty };
      return updated;
    });
  }, [products, showNotification]);

  // --- Handler Hapus Item dari Keranjang ---
  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  // --- Handler Kosongkan Keranjang ---
  const handlePullOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pullCode.trim()) return;
    
    setIsPulling(true);
    try {
      const res = await fetch(`/api/draft-orders/${pullCode}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setCustomerName(data.customerName || '');
      if (data.isReservation) {
        setOrderType('reservation');
        setDpAmount(data.dpAmount || 0);
      } else if (data.tableNumber) {
        setTableNumber(data.tableNumber);
        setOrderType('dine_in');
      }
      const newItems = data.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price || item.product.price,
        quantity: item.quantity,
        notes: ''
      }));
      
      setCartItems(newItems);
      setPullCode('');
      showNotification(`Berhasil menarik pesanan ${data.customerName}`);
    } catch (err: any) {
      showNotification(err.message || 'Gagal menarik pesanan');
    } finally {
      setIsPulling(false);
    }
  };

  const handleClearCart = useCallback(() => {
    setOrderType('dine_in');
    setTableNumber('');
    setCustomerName('');
    setActiveOrderId(null);
    setCartItems([]);
    setDpAmount(0);
    setGuideVoucher(null);
    setGuideInfo({ isGuideOrder: false, guideName: '' });
    setPaymentMode('pay_now');
  }, []);

  const handleApplyVoucher = useCallback((voucher: AppliedGuideVoucher | null) => {
    setGuideVoucher(voucher);
    if (!voucher) {
      // Remove free items if voucher is removed
      setCartItems(prev => prev.filter(i => !i.isFree));
      return;
    }

    if (voucher.rewards?.freeProducts && voucher.rewards.freeProducts.length > 0) {
      const newFreeItems: OrderItem[] = [];
      voucher.rewards.freeProducts.forEach((freeProd: any) => {
        const product = products.find(p => p._id === freeProd.productId);
        if (product) {
          newFreeItems.push({
            productId: product._id,
            name: product.name,
            price: 0,
            quantity: freeProd.quantity,
            notes: '',
            isFree: true
          });
        }
      });
      if (newFreeItems.length > 0) {
        setCartItems(prev => {
          // Remove existing free items to avoid duplicates
          const withoutFree = prev.filter(i => !i.isFree);
          return [...withoutFree, ...newFreeItems];
        });
      }
    }
  }, [products]);

  // --- Handler Pilih Faktur Gantung untuk Dilunasi ---
  const handleSelectFakturOrder = useCallback((order: Order) => {
    setOrderType(order.orderType === 'takeaway' ? 'takeaway' : 'dine_in');
    setTableNumber(order.tableNumber || '');
    setCustomerName(order.customerName);
    
    // Set savedQuantity to prevent cashier from deleting already-sent items
    const savedItems = order.items.map(item => ({
      ...item,
      savedQuantity: item.quantity
    }));
    
    setCartItems(savedItems);
    setDpAmount(order.dpAmount || 0);
    setActiveOrderId(order._id);
    setPaymentMode('pay_now');

    if (order.guideCode) {
      setGuideVoucher({
        code: order.guideCode,
        guideName: order.guideName || 'Guide',
        rewards: {
          cashbackAmount: order.guideCommission || 0,
          discountPercentage: order.discountAmount ? (order.discountAmount / order.subtotal) * 100 : 0
        }
      });
    } else {
      setGuideVoucher(null);
    }

    setIsFakturModalOpen(false);
    showNotification(
      `Faktur meja ${order.tableNumber || 'TA'} atas nama ${order.customerName} dimuat ke keranjang.`
    );
  }, [showNotification]);

  // --- Handler Simpan ke Faktur Gantung ---
  const handleSaveFakturGantung = useCallback(async () => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    
    let guideCommission = 0;
    let discountAmount = 0;
    if (guideVoucher) {
      if (guideVoucher.rewards?.cashbackAmount) {
        guideCommission = guideVoucher.rewards.cashbackAmount;
      }
      if (guideVoucher.rewards?.discountPercentage) {
        discountAmount = (subtotal * guideVoucher.rewards.discountPercentage) / 100;
      }
    }
    const grandTotal = Math.max(0, subtotal - dpAmount - discountAmount);

    try {
      const url = activeOrderId ? `/api/pos/transactions/${activeOrderId}` : '/api/pos/transactions';
      const method = activeOrderId ? 'PUT' : 'POST';
      
      const payload = {
        tableNumber: orderType === 'takeaway' ? 'TA' : (tableNumber || '00'),
        customerName: customerName || (orderType === 'takeaway' ? 'Bungkus' : 'Makan Sini'),
        orderType,
        paymentStatus: 'unpaid',
        items: cartItems,
        subtotal,
        dpAmount,
        discountAmount,
        guideCommission,
        guideCode: guideVoucher?.code || '',
        guideName: guideVoucher?.guideName || (guideInfo.isGuideOrder ? (guideInfo.guideName || 'Guide') : ''),
        isGuideOrder: guideInfo.isGuideOrder,
        isGuideRewardProcessed: false,
        grandTotal,
        amountReceived: 0,
        changeAmount: 0,
        ...(activeOrderId ? {} : { invoiceNumber: `INV-${Date.now()}` })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan faktur');

      showNotification(`Pesanan Meja ${tableNumber || '00'} berhasil diperbarui di Faktur Gantung.`);
      handleClearCart();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  }, [
    cartItems,
    tableNumber,
    customerName,
    orderType,
    dpAmount,
    guideVoucher,
    guideInfo,
    activeOrderId,
    handleClearCart,
    fetchData,
    showNotification
  ]);


  // --- Handler Bayar Lunas (Online & Offline Support) ---
  const handleConfirmPayment = useCallback(async (amountReceived: number, change: number, paymentMethod: 'tunai' | 'qris') => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    
    let guideCommission = 0;
    let discountAmount = 0;
    if (guideVoucher) {
      if (guideVoucher.rewards?.cashbackAmount) {
        guideCommission = guideVoucher.rewards.cashbackAmount;
      }
      if (guideVoucher.rewards?.discountPercentage) {
        discountAmount = (subtotal * guideVoucher.rewards.discountPercentage) / 100;
      }
    }
    const grandTotal = Math.max(0, subtotal - dpAmount - discountAmount);

    let useOfflineFallback = !isOnline;
    let transactionResult: any = null;

    if (!useOfflineFallback) {
      try {
        let res;
        if (activeOrderId) {
          // Lunasi faktur gantung
          res = await fetch(`/api/pos/transactions/${activeOrderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentStatus: 'paid',
              paymentMethod,
              amountReceived,
              changeAmount: change
            })
          });
        } else {
          // Transaksi baru langsung lunas
          res = await fetch('/api/pos/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceNumber: `INV-${Date.now()}`,
              tableNumber: orderType === 'takeaway' ? 'TA' : (tableNumber || '00'),
              customerName: customerName || (orderType === 'takeaway' ? 'Bungkus' : 'Makan Sini'),
              orderType,
              paymentStatus: 'paid',
              paymentMethod,
              items: cartItems,
              subtotal,
              dpAmount,
              discountAmount,
              guideCommission,
              guideCode: guideVoucher?.code || '',
              guideName: guideVoucher?.guideName || (guideInfo.isGuideOrder ? (guideInfo.guideName || 'Guide') : ''),
              isGuideOrder: guideInfo.isGuideOrder,
              isGuideRewardProcessed: false,
              grandTotal,
              amountReceived,
              changeAmount: change
            })
          });
        }

        if (res.ok) {
          transactionResult = await res.json();
        } else {
          // Jika server error (500/503) atau jaringan tidak stabil, fallback ke offline
          if (res.status >= 500) {
            useOfflineFallback = true;
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Gagal memproses transaksi');
          }
        }
      } catch (err: any) {
        // Jika fetch network error (koneksi terputus saat transaksi)
        if (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('Network')) {
          useOfflineFallback = true;
        } else {
          alert(err.message);
          return;
        }
      }
    }

    // Jika sedang Offline atau server tidak terjangkau, simpan ke IndexedDB lokal
    if (useOfflineFallback) {
      const clientTxId = `tx_offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const offlineInvoice = `INV-OFFLINE-${Date.now()}`;
      const offlineCreatedAt = new Date().toISOString();

      const offlinePayload = {
        clientTxId,
        invoiceNumber: offlineInvoice,
        tableNumber: orderType === 'takeaway' ? 'TA' : (tableNumber || '00'),
        customerName: customerName || (orderType === 'takeaway' ? 'Bungkus' : 'Makan Sini'),
        orderType,
        paymentStatus: 'paid' as const,
        paymentMethod,
        items: cartItems,
        subtotal,
        dpAmount,
        discountAmount,
        guideCommission,
        guideCode: guideVoucher?.code || '',
        guideName: guideVoucher?.guideName || (guideInfo.isGuideOrder ? (guideInfo.guideName || 'Guide') : ''),
        isGuideOrder: guideInfo.isGuideOrder,
        isGuideRewardProcessed: false,
        grandTotal,
        amountReceived,
        changeAmount: change,
        cashierName: session?.user?.name || session?.user?.username || 'Kasir',
        cashierId: session?.user?.id,
        offlineCreatedAt
      };

      await recordOfflineTransaction(offlinePayload);

      transactionResult = {
        _id: clientTxId,
        ...offlinePayload,
        isOfflineSync: true,
        createdAt: offlineCreatedAt
      };

      setIsPaymentModalOpen(false);
      showNotification(`MODE OFFLINE: Transaksi disimpan di perangkat! Struk dicetak. Data akan disinkronkan saat online.`);
      setLastTransaction(transactionResult);
      setIsReceiptModalOpen(true);
      setDashboardStats(prev => ({
        revenueToday: prev.revenueToday + grandTotal,
        transactionsCount: prev.transactionsCount + 1
      }));
      return;
    }

    setIsPaymentModalOpen(false);
    
    let notif = `PEMBAYARAN LUNAS BERHASIL! Meja ${tableNumber || '-'}. Total dibayar: Rp ${grandTotal.toLocaleString('id-ID')}.`;
    if (change > 0) notif += ` Kembalian: Rp ${change.toLocaleString('id-ID')}.`;
    
    showNotification(notif);
    
    // Buka receipt modal dan simpan data transaksi
    setLastTransaction(transactionResult);
    setIsReceiptModalOpen(true);
    fetchData();
  }, [
    cartItems,
    dpAmount,
    guideVoucher,
    guideInfo,
    tableNumber,
    orderType,
    customerName,
    activeOrderId,
    showNotification,
    fetchData,
    isOnline,
    recordOfflineTransaction,
    session
  ]);

  
  const handleCloseReceipt = () => {
    setIsReceiptModalOpen(false);
    handleClearCart();
  };


  // --- Handler Verifikasi PIN Void ---
  const handleConfirmVoid = useCallback(
    async (pin: string, reason: string) => {
      try {
        const res = await fetch('/api/pos/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          alert(data.error || 'Otorisasi gagal');
          return;
        }

        // Jika ada activeOrderId (pesanan sudah difaktur-gantungkan), hapus dari backend
        if (activeOrderId) {
          const deleteRes = await fetch(`/api/pos/transactions/${activeOrderId}`, {
            method: 'DELETE',
          });
          if (!deleteRes.ok) {
            console.error('Gagal menghapus faktur gantung');
          }
        }

        setIsVoidModalOpen(false);
        showNotification(
          `OTORISASI BERHASIL. Pesanan Meja ${tableNumber || '-'} dibatalkan dengan alasan: "${reason}".`
        );
        handleClearCart();
        fetchData(); // Refresh data supaya faktur gantung hilang
      } catch (error: any) {
        alert('Terjadi kesalahan sistem');
      }
    },
    [tableNumber, activeOrderId, handleClearCart, showNotification, fetchData]
  );

  // --- Handler Load Draft Order (Reservasi) ---
  const handleLoadReservation = useCallback((draftData: any) => {
    // Kosongkan cart saat ini
    setCartItems([]);
    setCustomerName(draftData.customerName || '');
    setTableNumber(draftData.tableNumber || '');
    setOrderType('reservation');
    
    // Load item ke cart
    if (draftData.items && draftData.items.length > 0) {
      const newItems: OrderItem[] = draftData.items.map((item: any) => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      }));
      setCartItems(newItems);
    }
    
    showNotification('Berhasil menarik data reservasi!');
  }, [showNotification]);

  // --- Keyboard Shortcuts --- (F2 untuk Faktur Gantung, Esc untuk modal) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setIsFakturModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFakturModalOpen(false);
        setIsVoidModalOpen(false);
        setIsPaymentModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Calculate Grand Total for Payment Modal ---
  const calculatedSubtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const calculatedDiscount = guideVoucher?.rewards?.discountPercentage 
    ? (calculatedSubtotal * guideVoucher.rewards.discountPercentage / 100)
    : 0;
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal - dpAmount - calculatedDiscount);
  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFFDF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4B3832] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#6F4E37] tracking-wider uppercase">Memuat Kasir Dapoer Thatha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FFFDF7]">
      {/* Sidebar Navigation */}
      <POSSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenPrinter={() => setIsPrinterModalOpen(true)}
      />

      {/* ========================================================
          1. TOP BAR TERINTEGRASI (SEJAJAR):
             Kiri: Header Kasir & Navigasi
             Kanan: Input Kode Pesanan
             Dibatasi Garis Penengah Tepi (Vertical Divider)
          ======================================================== */}
      <header className="shrink-0 flex items-stretch bg-[#FFFDF7] border-b border-[#DCC7AA]/60 z-30">
        {/* Sisi Kiri Top Bar: POSHeader */}
        <div className="flex-1 min-w-0">
          <POSHeader
            cashierName={session?.user?.name || 'Kasir'}
            shiftName={session?.user?.role || 'Staff'}
            openOrdersCount={fakturOrders.length}
            totalOrders={dashboardStats.transactionsCount}
            totalRevenue={dashboardStats.revenueToday}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenFakturGantung={() => setIsFakturModalOpen(true)}
            onOpenTarikReservasi={() => setIsTarikReservasiModalOpen(true)}
          />
        </div>

        {/* GARIS PEMBATAS TEPI DI TOP BAR (Vertical Divider) */}
        <div className="w-[1px] bg-[#DCC7AA]/60 shrink-0" />

        {/* Sisi Kanan Top Bar: Input Kode Pesanan (Sejajar dengan Navbar) */}
        <div className="w-full lg:w-[390px] xl:w-[420px] 2xl:w-[450px] shrink-0 px-3 md:px-4 py-2 flex items-center bg-[#FFFDF7]">
          <form onSubmit={handlePullOrder} className="flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="Kode Pesanan (Cth: 1234)" 
              value={pullCode}
              onChange={(e) => setPullCode(e.target.value)}
              className="flex-1 bg-white border border-[#DCC7AA] focus:border-[#4B3832] text-[#4B3832] px-3 py-1.5 rounded-xl font-medium outline-none transition-all uppercase text-xs"
              maxLength={4}
              inputMode="numeric"
            />
            <button 
              type="submit" 
              disabled={isPulling || !pullCode.trim()}
              className="bg-[#4B3832] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#6F4E37] disabled:opacity-50 transition-colors whitespace-nowrap shadow-xs"
            >
              {isPulling ? 'Menarik...' : 'Tarik Pesanan'}
            </button>
          </form>
        </div>
      </header>

      {/* ========================================================
          2. AREA KONTEN UTAMA (Di Bawah Top Bar)
          ======================================================== */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Kolom Kiri: Notifikasi Banner + Katalog Menu (Scrollable) */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Banner Notifikasi Aksi */}
          {notifMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="bg-emerald-600 text-white font-extrabold px-6 py-2.5 border-b-2 border-emerald-800 shadow-sm flex items-center justify-between z-10 shrink-0"
            >
              <span className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                <span>{notifMessage}</span>
              </span>
              <button
                type="button"
                onClick={() => setNotifMessage('')}
                className="text-xs font-black uppercase px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 rounded border border-emerald-700 cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Konten Katalog Menu & Pencarian */}
          <section className="flex-1 p-4 md:p-5 flex flex-col gap-4 overflow-y-auto min-h-0 custom-scrollbar">
            {/* Search Bar */}
            <div className="relative w-full shrink-0">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F4E37]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Cari Menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FFFDF7] border-2 border-[#DCC7AA]/40 text-[#4B3832] pl-12 pr-12 py-2.5 rounded-[2rem] font-medium outline-none focus:border-[#DCC7AA] focus:shadow-sm transition-all text-sm"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/40 text-xs font-bold border border-[#DCC7AA]/40 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            <CategoryTabs
              categories={categories}
              activeCategorySlug={activeCategorySlug}
              onSelectCategory={setActiveCategorySlug}
              menuCounts={menuCounts}
            />

            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
            />
          </section>
        </main>

        {/* GARIS PEMBATAS TEPI (Vertical Divider dari atas sampai bawah) */}
        <div className="w-[1px] bg-[#DCC7AA]/60 shrink-0" />

        {/* Kolom Kanan: Card Nota Pesanan (Mulai tepat di bawah garis top bar, full height) */}
        <aside className="w-full lg:w-[390px] xl:w-[420px] 2xl:w-[450px] shrink-0 p-3 md:p-3.5 flex flex-col h-full overflow-hidden bg-[#FFFDF7]">
          <div className="flex-1 min-h-0">
            <OrderCart
              orderType={orderType}
              tableNumber={tableNumber}
              customerName={customerName}
              items={cartItems}
              paymentMode={paymentMode}
              dpAmount={dpAmount}
              guideInfo={guideInfo}
              onUpdateGuideInfo={setGuideInfo}
              guideVoucher={guideVoucher}
              onChangeOrderType={setOrderType}
              onUpdateTableNumber={setTableNumber}
              onUpdateCustomerName={setCustomerName}
              onUpdateQuantity={handleUpdateQuantity}
              onChangePaymentMode={setPaymentMode}
              onApplyVoucher={handleApplyVoucher}
              onSaveFakturGantung={handleSaveFakturGantung}
              onPayNow={() => setIsPaymentModalOpen(true)}
              onOpenVoidModal={() => setIsVoidModalOpen(true)}
              onClearCart={handleClearCart}
            />
          </div>
        </aside>
      </div>

      {/* 4. Modal Antrean Faktur Gantung */}
      <FakturGantungModal
        isOpen={isFakturModalOpen}
        orders={fakturOrders}
        onClose={() => setIsFakturModalOpen(false)}
        onSelectOrder={handleSelectFakturOrder}
      />

      {/* 5. Modal Keamanan PIN Void Owner */}
      <VoidPinModal
        isOpen={isVoidModalOpen}
        tableNumber={tableNumber}
        onClose={() => setIsVoidModalOpen(false)}
        onConfirmVoid={handleConfirmVoid}
      />

      {/* Printer Settings Modal */}
      <PrinterSettingsModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        grandTotal={calculatedGrandTotal}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />
    
      <ReceiptModal 
        isOpen={isReceiptModalOpen}
        transactionData={lastTransaction}
        onClose={handleCloseReceipt}
      />
      <TarikReservasiModal
        isOpen={isTarikReservasiModalOpen}
        onClose={() => setIsTarikReservasiModalOpen(false)}
        onLoadReservation={handleLoadReservation}
      />
      <OfflineSyncModal />
    </div>
  );
}