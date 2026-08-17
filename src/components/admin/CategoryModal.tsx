// src/components/admin/CategoryModal.tsx
'use client';

import React, { useState } from 'react';
import { Category } from '@/types/pos';

interface CategoryModalProps {
  isOpen: boolean;
  initialData?: Category | null;
  onClose: () => void;
  onSave: (categoryData: { _id?: string; name: string; slug: string }) => void;
}

interface CategoryFormProps {
  initialData?: Category | null;
  onClose: () => void;
  onSave: (categoryData: { _id?: string; name: string; slug: string }) => void;
}

function CategoryForm({ initialData, onClose, onSave }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      // Auto generate slug jika buat baru
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Slug kategori tidak boleh kosong.');
      return;
    }
    onSave({
      _id: initialData?._id,
      name: name.trim(),
      slug: slug.trim(),
    });
  };

  return (
    <div className="bg-white rounded-2xl border-4 border-[#78350f] shadow-2xl w-full max-w-lg p-6 space-y-5">
      {/* Header Modal */}
      <div className="border-b-2 border-[#e7e5e4] pb-3 flex items-center justify-between">
        <div>
          <span className="bg-[#78350f] text-[#fcd34d] font-extrabold text-xs px-2.5 py-1 rounded uppercase tracking-wider border border-[#f59e0b]">
            KATEGORI MENU
          </span>
          <h2 id="category-modal-title" className="text-2xl font-black text-[#291404] mt-2">
            {initialData ? 'EDIT KATEGORI MENU' : 'TAMBAH KATEGORI BARU'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-extrabold px-3 py-1.5 bg-[#fefce8] hover:bg-[#fef3c7] text-[#57300a] rounded-lg border-2 border-[#d6d3d1] cursor-pointer"
        >
          Tutup [Esc]
        </button>
      </div>

      {/* Form Input Kategori */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cat-name-input" className="block text-base font-black text-[#291404] mb-1">
            Nama Kategori:
          </label>
          <input
            id="cat-name-input"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Contoh: Paket Keluarga / Minuman Tradisional"
            autoFocus
            className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-3 font-bold text-lg text-[#291404] focus:border-[#d97706]"
          />
        </div>

        <div>
          <label htmlFor="cat-slug-input" className="block text-base font-black text-[#291404] mb-1">
            Slug Kategori (ID URL):
          </label>
          <input
            id="cat-slug-input"
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="contoh: paket-keluarga"
            className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-3 font-mono font-bold text-base text-[#57300a] focus:border-[#d97706]"
          />
          <p className="text-xs font-bold text-[#78350f] mt-1">
            * Digunakan oleh sistem untuk pengelompokan menu (huruf kecil &amp; tanda strip).
          </p>
        </div>

        {errorMsg && (
          <div role="alert" className="bg-red-100 border-2 border-red-500 text-red-900 font-bold px-4 py-2.5 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
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
            {initialData ? 'Simpan Perubahan' : '+ Simpan Kategori'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CategoryModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
    >
      <CategoryForm
        key={initialData?._id || 'new-category'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}
