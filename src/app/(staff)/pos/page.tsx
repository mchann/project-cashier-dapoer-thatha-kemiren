// src/app/(staff)/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, OrderItem, Order } from '@/types/pos';
import {
  DUMMY_CATEGORIES,
  DUMMY_PRODUCTS,
  DUMMY_PARTNERS,
  DUMMY_FAKTUR_GANTUNG,
} from '@/lib/dummy-pos-data';
import { POSHeader } from '@/components/pos/POSHeader';
import { CategoryTabs } from '@/components/pos/CategoryTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderCart } from '@/components/pos/OrderCart';
import { FakturGantungModal } from '@/components/pos/FakturGantungModal';
import { VoidPinModal } from '@/components/pos/VoidPinModal';

export default function POSPage() {
  // --- State Filter Kategori ---
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');

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
  const [isFakturModalOpen, setIsFakturModalOpen] = useState<boolean>(false);
  const [isVoidModalOpen, setIsVoidModalOpen] = useState<boolean>(false);
  const [fakturOrders, setFakturOrders] = useState<Order[]>(DUMMY_FAKTUR_GANTUNG);

  // --- State Notifikasi Aksi Kasir (A11y Alert) ---
  const [notifMessage, setNotifMessage] = useState<string>('');

  const showNotification = useCallback((msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => {
      setNotifMessage('');
    }, 4000);
  }, []);

  // --- Filter Produk berdasarkan Kategori ---
  const filteredProducts = useMemo(() => {
    if (activeCategorySlug === 'all') {
      return DUMMY_PRODUCTS;
    }
    const cat = DUMMY_CATEGORIES.find((c) => c.slug === activeCategorySlug);
    if (!cat) return DUMMY_PRODUCTS;
    return DUMMY_PRODUCTS.filter((p) => p.categoryId === cat._id);
  }, [activeCategorySlug]);

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

    setFakturOrders((prev) => [newOrder, ...prev]);
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
  const handlePayNow = useCallback(() => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

    // Hapus dari daftar faktur gantung jika meja yang sama sudah ada di antrean
    setFakturOrders((prev) =>
      prev.filter((o) => o.tableNumber !== tableNumber)
    );

    showNotification(
      `PEMBAYARAN LUNAS BERHASIL! Meja ${tableNumber || '-'}. Total dibayar: Rp ${grandTotal.toLocaleString('id-ID')}`
    );
    handleClearCart();
  }, [cartItems, dpAmount, guideCommission, tableNumber, handleClearCart, showNotification]);

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
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#fdfbf7]">
      {/* 1. Header POS Kasir */}
      <POSHeader
        cashierName="Siti (Kasir 01)"
        shiftName="Shift Pagi (08:00 - 16:00)"
        openOrdersCount={fakturOrders.length}
        onOpenFakturGantung={() => setIsFakturModalOpen(true)}
      />

      {/* 2. Banner Notifikasi Aksi (A11y Live Region) */}
      {notifMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-[#78350f] text-[#fefce8] font-extrabold px-6 py-3 border-b-4 border-[#d97706] shadow-md flex items-center justify-between"
        >
          <span>✓ {notifMessage}</span>
          <button
            type="button"
            onClick={() => setNotifMessage('')}
            className="text-xs uppercase px-2 py-1 bg-[#451a03] rounded border border-[#d97706] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 3. Area Utama Kasir (Katalog Menu Kiri & Keranjang Kanan) */}
      <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
        {/* Kolom Kiri: Katalog Menu & Kategori (Span 7 / 8) */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
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
        <section className="lg:col-span-5 xl:col-span-4 h-full">
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
            onRemoveItem={handleRemoveItem}
            onChangePaymentMode={setPaymentMode}
            onTogglePartner={setIsPartnerOrder}
            onSelectPartner={(id, name) => {
              setSelectedPartnerId(id);
              setSelectedPartnerName(name);
            }}
            onChangeCommission={setGuideCommission}
            onSaveFakturGantung={handleSaveFakturGantung}
            onPayNow={handlePayNow}
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
    </div>
  );
}
