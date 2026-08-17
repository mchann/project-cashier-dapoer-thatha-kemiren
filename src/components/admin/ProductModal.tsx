// src/components/admin/ProductModal.tsx
'use client';

import React, { useState } from 'react';
import { Product, Category } from '@/types/pos';

interface ProductModalProps {
  isOpen: boolean;
  initialData?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (productData: {
    _id?: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image?: string;
    categoryId: string;
    isAvailable: boolean;
  }) => void;
}

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (productData: {
    _id?: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image?: string;
    categoryId: string;
    isAvailable: boolean;
  }) => void;
}

function ProductForm({
  initialData,
  categories,
  onClose,
  onSave,
}: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories[0]?._id ?? '')
  );
  const [price, setPrice] = useState<number | ''>(
    initialData?.price ?? ''
  );
  const [stock, setStock] = useState<number | ''>(
    initialData?.stock ?? 10
  );
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [image, setImage] = useState(initialData?.image || '');
  const [isAvailable, setIsAvailable] = useState(
    initialData?.isAvailable ?? true
  );
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama menu tidak boleh kosong.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Silakan pilih kategori menu.');
      return;
    }
    if (price === '' || price < 0) {
      setErrorMsg('Harga menu harus diisi dengan benar (≥ Rp 0).');
      return;
    }
    if (stock === '' || stock < 0) {
      setErrorMsg('Stok porsi matang tidak boleh negatif.');
      return;
    }

    onSave({
      _id: initialData?._id,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      image: image.trim(),
      categoryId,
      isAvailable: Number(stock) > 0 ? isAvailable : false,
    });
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-[#78350f] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
      {/* Header Modal */}
      <div className="bg-[#451a03] text-white px-6 py-4 border-b-2 border-[#d97706] flex items-center justify-between">
        <div>
          <span className="bg-[#78350f] text-[#fcd34d] font-extrabold text-xs px-2.5 py-1 rounded uppercase tracking-wider border border-[#f59e0b]">
            MANAJEMEN MENU MAKANAN / MINUMAN
          </span>
          <h2 id="product-modal-title" className="text-2xl font-black text-[#fefce8] mt-1">
            {initialData ? 'EDIT DATA MENU' : 'TAMBAH MENU BARU'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold px-4 py-2 bg-[#78350f] hover:bg-[#451a03] text-white rounded-lg border border-[#f59e0b] cursor-pointer"
        >
          Tutup [Esc]
        </button>
      </div>

      {/* Form Input Menu */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Menu */}
          <div>
            <label htmlFor="prod-name" className="block text-base font-black text-[#291404] mb-1">
              Nama Menu:
            </label>
            <input
              id="prod-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Contoh: Ayam Bakar Kemiren"
              autoFocus
              className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-2.5 font-bold text-lg text-[#291404] focus:border-[#d97706]"
            />
          </div>

          {/* Kategori Menu */}
          <div>
            <label htmlFor="prod-category" className="block text-base font-black text-[#291404] mb-1">
              Kategori Menu:
            </label>
            <select
              id="prod-category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-2.5 font-bold text-lg text-[#291404] focus:border-[#d97706]"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Harga */}
          <div>
            <label htmlFor="prod-price" className="block text-base font-black text-[#291404] mb-1">
              Harga Jual (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[#57300a]">
                Rp
              </span>
              <input
                id="prod-price"
                type="number"
                min={0}
                step={500}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl pl-12 pr-4 py-2.5 font-black text-xl text-[#291404] focus:border-[#d97706]"
              />
            </div>
          </div>

          {/* Stok Porsi Matang */}
          <div>
            <label htmlFor="prod-stock" className="block text-base font-black text-[#291404] mb-1">
              Stok Awal Porsi Matang:
            </label>
            <input
              id="prod-stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-2.5 font-black text-xl text-[#291404] focus:border-[#d97706]"
            />
          </div>
        </div>

        {/* Deskripsi untuk Customer */}
        <div>
          <label htmlFor="prod-desc" className="block text-base font-black text-[#291404] mb-1">
            Deskripsi Menu (Untuk Tampilan Menu Pelanggan):
          </label>
          <textarea
            id="prod-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Ayam kampung bakar khas Kemiren dengan bumbu gurih..."
            className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl p-3 font-bold text-base text-[#291404] focus:border-[#d97706]"
          />
          <p className="text-xs font-bold text-[#78350f] mt-1">
            * Akan ditampilkan pada e-Menu Pelanggan (QR Meja), namun sengaja disembunyikan di layar Kasir agar ringkas.
          </p>
        </div>

        {/* URL Foto Menu */}
        <div>
          <label htmlFor="prod-image" className="block text-base font-black text-[#291404] mb-1">
            URL Foto Menu (Opsional):
          </label>
          <input
            id="prod-image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-2 font-bold text-base text-[#57300a] focus:border-[#d97706]"
          />
        </div>

        {/* Status Tersedia / Aktif */}
        <div className="flex items-center gap-3 bg-[#fefce8] p-3.5 rounded-xl border-2 border-[#d6d3d1]">
          <input
            id="prod-available"
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="w-6 h-6 rounded border-2 border-[#78350f] text-[#78350f] focus:ring-[#d97706] cursor-pointer"
          />
          <label htmlFor="prod-available" className="text-base font-black text-[#291404] cursor-pointer">
            Menu Tersedia untuk Dijual / Aktif (Centang untuk aktif)
          </label>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div role="alert" className="bg-red-100 border-2 border-red-500 text-red-900 font-bold px-4 py-2.5 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex items-center gap-3 pt-3 border-t-2 border-[#e7e5e4]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#fefce8] hover:bg-[#fef3c7] text-[#291404] font-bold py-3.5 rounded-xl border-2 border-[#d6d3d1] cursor-pointer transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 bg-[#78350f] hover:bg-[#451a03] text-white font-black py-3.5 rounded-xl border-2 border-[#d97706] shadow-md cursor-pointer transition-colors"
          >
            {initialData ? 'Simpan Perubahan Menu' : '+ Tambahkan Menu'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ProductModal({
  isOpen,
  initialData,
  categories,
  onClose,
  onSave,
}: ProductModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 overflow-y-auto"
    >
      <ProductForm
        key={initialData?._id || 'new-product'}
        initialData={initialData}
        categories={categories}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
