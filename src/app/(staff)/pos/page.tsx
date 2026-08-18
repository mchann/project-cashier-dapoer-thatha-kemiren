// src/app/(staff)/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, OrderItem, Order, Category } from '@/types/pos';
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

export default function POSPage() {
  // --- State Filter Kategori & Pencarian ---
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- State Keranjang Pesanan ---
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<'pay_now' | 'save_faktur'>('pay_now');
  const [dpAmount, setDpAmount] = useState<number>(0);

  // --- State Mitra Travel / Guide ---
  const [isPartnerOrder, setIsPartnerOrder] = useState<boolean>(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [selectedPartnerName, setSelectedPartnerName] = useState<string>('');
  const [guideCommission, setGuideCommission] = useState<number>(0);

  // --- State Modals ---
  const [isFakturModalOpen, setIsFakturModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Derivasi data pesanan (Aktif)
  const fakturOrders = useMemo(() => DUMMY_FAKTUR_GANTUNG.filter((o) => o.paymentStatus !== 'paid'), []);

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
        // Mongoose populate menggantikan categoryId dengan object, kita normalkan:
        const formattedProd = dataProd.map((p: any) => ({
          ...p,
          categoryId: p.categoryId?._id || p.categoryId,
          category: p.categoryId?._id ? p.categoryId : undefined
        }));
        setProducts(formattedProd.filter((p: any) => p.isAvailable !== false));
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
      const catId = typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId;
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
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty <= 0 ? null : { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  }, []);

  // --- Handler Hapus Item dari Keranjang ---
  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // --- Handler Kosongkan Keranjang ---
  const handleClearCart = useCallback(() => {
    setOrderType('dine_in');
    setTableNumber('');
    setCustomerName('');
    setCartItems([]);
    setDpAmount(0);
    setIsPartnerOrder(false);
    setSelectedPartnerId('');
    setSelectedPartnerName('');
    setGuideCommission(0);
    setPaymentMode('pay_now');
  }, []);

  // --- Handler Pilih Faktur Gantung untuk Dilunasi ---
  const handleSelectFakturOrder = useCallback((order: Order) => {
    setOrderType(order.orderType === 'takeaway' ? 'takeaway' : 'dine_in');
    setTableNumber(order.tableNumber || '');
    setCustomerName(order.customerName);
    setCartItems(order.items);
    setDpAmount(order.dpAmount || 0);
    setPaymentMode('pay_now');

    if (order.partnerId || order.guideCommission > 0) {
      setIsPartnerOrder(true);
      setSelectedPartnerId(order.partnerId || '');
      setSelectedPartnerName(order.partnerName || '');
      setGuideCommission(order.guideCommission || 0);
    } else {
      setIsPartnerOrder(false);
      setSelectedPartnerId('');
      setSelectedPartnerName('');
      setGuideCommission(0);
    }

    setIsFakturModalOpen(false);
    showNotification(
      `Faktur meja ${order.tableNumber || 'TA'} atas nama ${order.customerName} dimuat ke keranjang.`
    );
  }, [showNotification]);

  // --- Handler Simpan ke Faktur Gantung ---
  const handleSaveFakturGantung = useCallback(() => {
    if (cartItems.length === 0) return;
    const newInvoice = `INV-20260803-00${fakturOrders.length + 1}`;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

    const effectiveTable = orderType === 'takeaway' ? 'TA' : (tableNumber || '00');
    const effectiveCustomer = customerName || (orderType === 'takeaway' ? 'Tamu Bungkus (TA)' : 'Tamu Dine-In');

    const newOrder: Order = {
      _id: `order-new-${Date.now()}`,
      invoiceNumber: newInvoice,
      tableNumber: effectiveTable,
      customerName: effectiveCustomer,
      orderType: orderType,
      paymentStatus: 'unpaid',
      items: cartItems,
      subtotal,
      dpAmount,
      guideCommission,
      grandTotal,
      partnerId: selectedPartnerId || undefined,
      partnerName: selectedPartnerName || undefined,
      createdAt: '03 Agu 2026 ' + new Date().toTimeString().slice(0, 5),
      isSmartMerged: false,
    };

    // setFakturOrders((prev) => [newOrder, ...prev]);
    showNotification(
      `Pesanan Meja ${tableNumber || '00'} berhasil disimpan ke antrean Faktur Gantung (${newInvoice}).`
    );
    handleClearCart();
  }, [
    cartItems,
    orderType,
    tableNumber,
    customerName,
    fakturOrders.length,
    dpAmount,
    guideCommission,
    selectedPartnerId,
    selectedPartnerName,
    handleClearCart,
    showNotification,
  ]);

  // --- Handler Bayar Lunas ---
  const handleConfirmPayment = useCallback(async (amountReceived: number, change: number) => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

    try {
      const res = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: `INV-${Date.now()}`,
          tableNumber: orderType === 'takeaway' ? 'TA' : (tableNumber || '00'),
          customerName: customerName || (orderType === 'takeaway' ? 'Bungkus' : 'Dine In'),
          orderType,
          paymentStatus: 'paid',
          items: cartItems,
          subtotal,
          dpAmount,
          guideCommission,
          grandTotal,
          amountReceived,
          changeAmount: change
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses transaksi');
      }

      setIsPaymentModalOpen(false);
      
      let notif = `PEMBAYARAN LUNAS BERHASIL! Meja ${tableNumber || '-'}. Total dibayar: Rp ${grandTotal.toLocaleString('id-ID')}.`;
      if (change > 0) {
        notif += ` Kembalian: Rp ${change.toLocaleString('id-ID')}.`;
      }
      
      showNotification(notif);
      handleClearCart();
      fetchData(); // Refresh stok dari database
      
    } catch (err: any) {
      alert(err.message);
    }
  }, [cartItems, dpAmount, guideCommission, tableNumber, orderType, customerName, handleClearCart, showNotification, fetchData]);

  // --- Handler Verifikasi PIN Void ---
  const handleConfirmVoid = useCallback(
    (pin: string, reason: string) => {
      // Simulasi sukses untuk demo front-end
      setIsVoidModalOpen(false);
      showNotification(
        `OTORISASI BERHASIL. Pesanan Meja ${tableNumber || '-'} dibatalkan dengan alasan: "${reason}". Stok dikembalikan (+1).`
      );
      handleClearCart();
    },
    [tableNumber, handleClearCart, showNotification]
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
        cashierName="Siti (Kasir 01)"
        shiftName="Shift Pagi (08:00 - 16:00)"
        openOrdersCount={fakturOrders.length}
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
            categories={DUMMY_CATEGORIES}
            activeCategorySlug={activeCategorySlug}
            onSelectCategory={setActiveCategorySlug}
          />

          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* Kolom Kanan: Panel Keranjang Pesanan (Span 5 / 4) */}
        <section className="lg:col-span-5 xl:col-span-4 h-full overflow-hidden">
          <OrderCart
            orderType={orderType}
            tableNumber={tableNumber}
            customerName={customerName}
            items={cartItems}
            paymentMode={paymentMode}
            dpAmount={dpAmount}
            guideCommission={guideCommission}
            partners={DUMMY_PARTNERS}
            isPartnerOrder={isPartnerOrder}
            selectedPartnerId={selectedPartnerId}
            onChangeOrderType={setOrderType}
            onUpdateTableNumber={setTableNumber}
            onUpdateCustomerName={setCustomerName}
            onUpdateQuantity={handleUpdateQuantity}
            onChangePaymentMode={setPaymentMode}
            onTogglePartner={setIsPartnerOrder}
            onSelectPartner={(id, name) => {
              setSelectedPartnerId(id);
              setSelectedPartnerName(name);
            }}
            onChangeCommission={setGuideCommission}
            onSaveFakturGantung={handleSaveFakturGantung}
            onPayNow={() => setIsPaymentModalOpen(true)}
            onOpenVoidModal={() => setIsVoidModalOpen(true)}
            onClearCart={handleClearCart}
          />
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
        grandTotal={Math.max(0, cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0) - dpAmount - guideCommission)}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
