'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/pos';
import { PendingOrder, PendingOrders } from './components/PendingOrders';
import { GuideVoucher, VoucherHistory } from './components/VoucherHistory';
import { RewardModal } from './components/RewardModal';

export default function GuideVoucherPage() {
  const [vouchers, setVouchers] = useState<GuideVoucher[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resVouchers, resPending, resProducts, resCategories] = await Promise.all([
        fetch('/api/admin/guides'),
        fetch('/api/pos/transactions?guidePending=true'),
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ]);

      if (resVouchers.ok) setVouchers(await resVouchers.json());
      if (resPending.ok) setPendingOrders(await resPending.json());
      if (resProducts.ok) {
        const prodData = await resProducts.json();
        setProducts(prodData.filter((p: any) => p.isAvailable !== false));
      }
      if (resCategories.ok) setCategories(await resCategories.json());
    } catch (err: any) {
      console.error('Failed to fetch data', err);
      setError('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenRewardModal = (order?: PendingOrder) => {
    setSelectedOrder(order || null);
    setIsModalOpen(true);
    setError('');
  };

  const handleCreate = async (payload: any) => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal membuat voucher');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      await fetch(`/api/admin/guides?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-4 md:px-8 md:py-6 pb-20 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#4B3832] tracking-tight mb-2">Manajemen Tour Guide</h1>
          <p className="text-[#8B7355] font-medium">Kelola pesanan dari Guide dan berikan reward berupa Cashback, Diskon, atau Makanan Gratis.</p>
        </div>
        <button
          onClick={() => handleOpenRewardModal()}
          className="bg-[#4B3832] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#6F4E37] transition-all shadow-md active:scale-95"
        >
          + Buat Voucher Manual
        </button>
      </div>

      <PendingOrders 
        isLoading={isLoading} 
        orders={pendingOrders} 
        onProcessReward={handleOpenRewardModal} 
        formatRupiah={formatRupiah} 
      />

      <VoucherHistory 
        isLoading={isLoading} 
        vouchers={vouchers} 
        onDelete={handleDelete} 
        formatRupiah={formatRupiah} 
        formatDate={formatDate} 
      />

      <RewardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        selectedOrder={selectedOrder}
        products={products}
        categories={categories}
        isSubmitting={isSubmitting}
        error={error}
        formatRupiah={formatRupiah}
      />
    </div>
  );
}
