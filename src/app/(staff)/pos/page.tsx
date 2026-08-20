// src/app/(staff)/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, OrderItem, Order, Category } from '@/types/pos';
import { AppliedGuideVoucher } from '@/components/pos/TravelPartnerSelector';
import {
  DUMMY_CATEGORIES,
  DUMMY_PRODUCTS,
  DUMMY_PARTNERS,
  DUMMY_FAKTUR_GANTUNG,
} from '@/lib/dummy-pos-data';
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
import { useSession } from 'next-auth/react';

export default function POSPage() {
  const { data: session } = useSession();
  
  // --- State Filter Kategori & Pencarian ---
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pullCode, setPullCode] = useState<string>('');
  const [isPulling, setIsPulling] = useState<boolean>(false);

  // --- State Keranjang Pesanan ---
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'save_faktur'>('pay_now');
  const [dpAmount, setDpAmount] = useState<number>(0);

  // --- State Mitra Travel / Guide ---
  const [guideVoucher, setGuideVoucher] = useState<AppliedGuideVoucher | null>(null);

  // --- State Modals ---
  const [isFakturModalOpen, setIsFakturModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
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
  const [categories, setCategories] = useState<Category[]>(DUMMY_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DUMMY_PRODUCTS);

  const fetchData = useCallback(async () => {
    try {
      const resCat = await fetch('/api/admin/categories');
      if (resCat.ok) {
        const dataCat = await resCat.json();
        // Tambahkan "Semua Menu" di paling depan
        setCategories([
          { _id: 'cat-all', name: 'Semua Menu', slug: 'all' },
          ...dataCat
        ]);
      }
      const resProd = await fetch('/api/admin/products');
      if (resProd.ok) {
        const dataProd = await resProd.json();
      const resPending = await fetch('/api/pos/transactions/pending');
      if (resPending.ok) {
        const dataPending = await resPending.json();
        setFakturOrders(dataPending);
      }
        // Mongoose populate menggantikan categoryId dengan object, kita normalkan:
        const formattedProd = dataProd.map((p: any) => ({
          ...p,
          categoryId: p.categoryId?._id || p.categoryId,
          category: p.categoryId?._id ? p.categoryId : undefined
        }));
        setProducts(formattedProd.filter((p: any) => p.isAvailable !== false));
      }
      const resStats = await fetch('/api/admin/dashboard');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setDashboardStats({ revenueToday: dataStats.revenueToday, transactionsCount: dataStats.transactionsCount });
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

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
    if (product.stock <= 0) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.productId === product._id);
      if (idx > -1) {
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
      
      const updated = [...prev];
      updated[itemIndex] = { ...item, quantity: nextQty };
      return updated;
    });
  }, []);

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
      if (data.tableNumber) {
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
    setPaymentMode('pay_now');
  }, []);

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
        rewardType: order.discountAmount ? 'discount' : 'cashback',
        amountType: 'nominal',
        amount: order.discountAmount || order.guideCommission
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
      if (guideVoucher.rewardType === 'cashback') {
        guideCommission = guideVoucher.amountType === 'percentage' ? (subtotal * guideVoucher.amount / 100) : guideVoucher.amount;
      } else {
        discountAmount = guideVoucher.amountType === 'percentage' ? (subtotal * guideVoucher.amount / 100) : guideVoucher.amount;
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
        guideName: guideVoucher?.guideName || '',
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
    activeOrderId,
    handleClearCart,
    fetchData,
    showNotification
  ]);


  // --- Handler Bayar Lunas ---
    const handleConfirmPayment = useCallback(async (amountReceived: number, change: number) => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    
    let guideCommission = 0;
    let discountAmount = 0;
    if (guideVoucher) {
      if (guideVoucher.rewardType === 'cashback') {
        guideCommission = guideVoucher.amountType === 'percentage' ? (subtotal * guideVoucher.amount / 100) : guideVoucher.amount;
      } else {
        discountAmount = guideVoucher.amountType === 'percentage' ? (subtotal * guideVoucher.amount / 100) : guideVoucher.amount;
      }
    }
    const grandTotal = Math.max(0, subtotal - dpAmount - discountAmount);

    try {
      let res;
      if (activeOrderId) {
        // Lunasi faktur gantung
        res = await fetch(`/api/pos/transactions/${activeOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus: 'paid',
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
            items: cartItems,
            subtotal,
            dpAmount,
            discountAmount,
            guideCommission,
            guideCode: guideVoucher?.code || '',
            guideName: guideVoucher?.guideName || '',
            grandTotal,
            amountReceived,
            changeAmount: change
          })
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses transaksi');

      setIsPaymentModalOpen(false);
      
      let notif = `PEMBAYARAN LUNAS BERHASIL! Meja ${tableNumber || '-'}. Total dibayar: Rp ${grandTotal.toLocaleString('id-ID')}.`;
      if (change > 0) notif += ` Kembalian: Rp ${change.toLocaleString('id-ID')}.`;
      
      showNotification(notif);
      
      // Buka receipt modal dan simpan data transaksi
      setLastTransaction(data);
      setIsReceiptModalOpen(true);
      fetchData();
      
    } catch (err: any) {
      alert(err.message);
    }
  }, [cartItems, dpAmount, guideVoucher, tableNumber, orderType, customerName, activeOrderId, showNotification, fetchData]);

  
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

  // --- Keyboard Shortcuts (F2 untuk Faktur Gantung, Esc untuk modal) ---
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
  const calculatedDiscount = guideVoucher && guideVoucher.rewardType === 'discount'
    ? (guideVoucher.amountType === 'percentage' ? calculatedSubtotal * guideVoucher.amount / 100 : guideVoucher.amount)
    : 0;
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal - dpAmount - calculatedDiscount);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FFFDF7]">
      {/* Sidebar Navigation */}
      <POSSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpenPrinter={() => setIsPrinterModalOpen(true)}
      />

      {/* 1. Header POS Kasir */}
      <POSHeader
        cashierName={session?.user?.name || 'Kasir'}
        shiftName={session?.user?.role || 'Staff'}
        openOrdersCount={fakturOrders.length}
        totalOrders={dashboardStats.transactionsCount}
        totalRevenue={dashboardStats.revenueToday}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenFakturGantung={() => setIsFakturModalOpen(true)}
      />

      {/* 2. Banner Notifikasi Aksi (A11y Live Region) */}
      {notifMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-emerald-600 text-white font-extrabold px-6 py-3 border-b-4 border-emerald-800 shadow-md flex items-center justify-between z-10"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            {notifMessage}
          </span>
          <button
            type="button"
            onClick={() => setNotifMessage('')}
            className="text-xs font-black uppercase px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 rounded-lg border border-emerald-700 cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 3. Area Utama Kasir (Katalog Menu Kiri & Keranjang Kanan) */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0">
        {/* Kolom Kiri: Katalog Menu & Kategori (Span 7 / 8) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 overflow-y-auto pb-4 custom-scrollbar">
          
          {/* Search Bar */}
          <div className="relative w-full">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6F4E37]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Cari Menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFDF7] border-2 border-[#DCC7AA]/40 text-[#4B3832] pl-12 pr-12 py-3.5 rounded-[2rem] font-medium outline-none focus:border-[#DCC7AA] focus:shadow-sm transition-all"
            />
            {/* Command Icon placeholder on the right */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F4E37]/40 text-xs font-bold border border-[#DCC7AA]/40 px-2 py-1 rounded-lg">⌘K</div>
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

        {/* Kolom Kanan: Panel Keranjang Pesanan (Span 5 / 4) */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="mb-4 shrink-0">
            <form onSubmit={handlePullOrder} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Kode Pesanan (Cth: 1234)" 
                value={pullCode}
                onChange={(e) => setPullCode(e.target.value)}
                className="flex-1 bg-white border-2 border-[#DCC7AA]/40 text-[#4B3832] px-4 py-2 rounded-xl font-medium outline-none focus:outline-none focus:ring-0 focus:border-[#8B7355] transition-all uppercase"
                maxLength={4}
                inputMode="numeric"
              />
              <button 
                type="submit" 
                disabled={isPulling || !pullCode.trim()}
                className="bg-[#4B3832] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#6F4E37] disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isPulling ? 'Menarik...' : 'Tarik Pesanan'}
              </button>
            </form>
          </div>
          <div className="flex-1 min-h-0">
            <OrderCart
              orderType={orderType}
              tableNumber={tableNumber}
              customerName={customerName}
              items={cartItems}
              paymentMode={paymentMode}
              dpAmount={dpAmount}
              guideVoucher={guideVoucher}
              onChangeOrderType={setOrderType}
              onUpdateTableNumber={setTableNumber}
              onUpdateCustomerName={setCustomerName}
              onUpdateQuantity={handleUpdateQuantity}
              onChangePaymentMode={setPaymentMode}
              onApplyVoucher={setGuideVoucher}
              onSaveFakturGantung={handleSaveFakturGantung}
              onPayNow={() => setIsPaymentModalOpen(true)}
              onOpenVoidModal={() => setIsVoidModalOpen(true)}
              onClearCart={handleClearCart}
            />
          </div>
        </section>
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
    </div>
  );
}