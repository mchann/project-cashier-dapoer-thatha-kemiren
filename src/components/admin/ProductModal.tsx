// src/components/admin/ProductModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
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

function ProductForm({
  initialData,
  categories,
  onClose,
  onSave,
}: Omit<ProductModalProps, 'isOpen'>) {
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
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg('');

      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result;
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64data }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Gagal mengunggah gambar');
          }
          setImage(data.url);
        } catch (error) {
          const err = error as Error;
          console.error('Upload API error:', err);
          setErrorMsg(err.message || 'Gagal mengirim gambar ke server.');
        } finally {
          setIsUploading(false);
        }
      };
    } catch (error) {
      const err = error as Error;
      console.error('Compression error:', err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses foto.');
      setIsUploading(false);
    }
  };

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
    <div className="bg-[#FFFDF7] rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header Modal */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
        <h2 id="product-modal-title" className="text-2xl font-bold text-[#4B3832]">
          {initialData ? 'Edit Menu' : 'Tambah Menu Baru'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#4B3832] text-[#FFFDF7] flex items-center justify-center hover:bg-[#6F4E37] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Scrollable Form Container */}
      <div className="px-8 pb-8 overflow-y-auto flex-1 custom-scrollbar">
        <form id="product-form" onSubmit={handleSubmit} className="border border-[#DCC7AA]/70 rounded-[2rem] p-8 space-y-6">
          
          {/* Upload Section */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-[#F5E6CA]/30 border border-[#DCC7AA] flex items-center justify-center overflow-hidden relative shadow-sm">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-[#DCC7AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-[#FFFDF7]/80 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-6 border-2 border-[#6F4E37] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#4B3832] mb-1">Upload Foto Menu</h3>
              <p className="text-xs text-[#6F4E37] mb-3">Otomatis dikompres &lt;200KB (JPG/PNG/WEBP)</p>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-5 py-2 rounded-full bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Upload
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    disabled={isUploading}
                    className="px-5 py-2 rounded-full border border-[#DCC7AA] bg-[#FFFDF7] hover:bg-[#F5E6CA] text-[#4B3832] text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Nama Menu */}
            <div>
              <label htmlFor="prod-name" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Nama Menu
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
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
              />
            </div>

            {/* Kategori Menu */}
            <div>
              <label htmlFor="prod-category" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Kategori
              </label>
              <div className="relative">
                <select
                  id="prod-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6F4E37]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
            </div>

            {/* Harga */}
            <div>
              <label htmlFor="prod-price" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Harga Jual (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6F4E37]">Rp</span>
                <input
                  id="prod-price"
                  type="number"
                  min={0}
                  step={500}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
                />
              </div>
            </div>

            {/* Stok */}
            <div>
              <label htmlFor="prod-stock" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Stok Awal
              </label>
              <input
                id="prod-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label htmlFor="prod-desc" className="block text-sm font-medium text-[#6F4E37] mb-2">
              Deskripsi Menu
            </label>
            <textarea
              id="prod-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Ayam kampung bakar khas Kemiren dengan bumbu gurih..."
              className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA] resize-none"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              id="prod-available"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-5 h-5 rounded border-[#DCC7AA] text-[#4B3832] focus:ring-[#6F4E37] cursor-pointer"
            />
            <label htmlFor="prod-available" className="text-sm font-semibold text-[#4B3832] cursor-pointer select-none">
              Tersedia / Aktif
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl">
              {errorMsg}
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-full border border-[#DCC7AA] bg-[#FFFDF7] hover:bg-[#F5E6CA] text-[#4B3832] text-sm font-bold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            className="px-8 py-3 rounded-full bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] text-sm font-bold transition-colors shadow-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
