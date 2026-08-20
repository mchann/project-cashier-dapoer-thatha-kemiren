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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
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

function CategoryForm({ initialData, onClose, onSave }: Omit<CategoryModalProps, 'isOpen'>) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
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
    <div className="bg-[#FFFDF7] rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header Modal */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
        <h2 id="category-modal-title" className="text-2xl font-bold text-[#4B3832]">
          {initialData ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#4B3832] text-[#FFFDF7] flex items-center justify-center hover:bg-[#6F4E37] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Form Container */}
      <div className="px-8 pb-8 overflow-y-auto flex-1 custom-scrollbar">
        <form id="category-form" onSubmit={handleSubmit} className="border border-[#DCC7AA]/70 rounded-[2rem] p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div>
              <label htmlFor="cat-name-input" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Nama Kategori
              </label>
              <input
                id="cat-name-input"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Minuman Segar"
                autoFocus
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
              />
            </div>

            <div>
              <label htmlFor="cat-slug-input" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Slug (ID URL)
              </label>
              <input
                id="cat-slug-input"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="ex: minuman-segar"
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
              />
            </div>
          </div>

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
            form="category-form"
            className="px-8 py-3 rounded-full bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] text-sm font-bold transition-colors shadow-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
