// src/app/(admin)/admin/menu/page.tsx
'use client';

import React, { useState } from 'react';
import { Category, Product } from '@/types/pos';
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from '@/lib/dummy-pos-data';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';

export default function AdminMenuPage() {
  // State Data Master (Kategori & Produk)
  const [categories, setCategories] = useState<Category[]>(
    DUMMY_CATEGORIES.filter((c) => c.slug !== 'all')
  );
  const [products, setProducts] = useState<Product[]>(DUMMY_PRODUCTS);

  // Tab aktif: 'products' | 'categories'
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  // Filter & Pencarian
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State Modal Produk
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // State Modal Kategori
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Notifikasi Aksi Owner
  const [notifMessage, setNotifMessage] = useState<string>('');

  const showNotification = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => setNotifMessage(''), 5000);
  };

  // ----------------------------------------------------
  // LOGIKA PRODUK / MENU
  // ----------------------------------------------------

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (prodData: {
    _id?: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    image?: string;
    categoryId: string;
    isAvailable: boolean;
  }) => {
    const catObj = categories.find((c) => c._id === prodData.categoryId) || {
      _id: prodData.categoryId,
      name: 'Umum',
      slug: 'umum',
    };

    if (prodData._id) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === prodData._id
            ? {
                ...p,
                name: prodData.name,
                description: prodData.description,
                price: prodData.price,
                stock: prodData.stock,
                image: prodData.image || '',
                categoryId: prodData.categoryId,
                category: catObj,
                isAvailable: prodData.isAvailable,
              }
            : p
        )
      );
      showNotification(`Berhasil memperbarui menu: "${prodData.name}".`);
    } else {
      const newProduct: Product = {
        _id: `prod-${Date.now()}`,
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        stock: prodData.stock,
        image: prodData.image || '',
        categoryId: prodData.categoryId,
        category: catObj,
        isAvailable: prodData.isAvailable,
      };
      setProducts((prev) => [newProduct, ...prev]);
      showNotification(`Berhasil menambahkan menu baru: "${prodData.name}".`);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus menu "${productName}"?`
    );
    if (!confirmDelete) return;

    setProducts((prev) => prev.filter((p) => p._id !== productId));
    showNotification(`Menu "${productName}" berhasil dihapus.`);
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return {
            ...p,
            stock: newStock,
            isAvailable: newStock > 0 ? p.isAvailable : false,
          };
        }
        return p;
      })
    );
    showNotification(`Stok berhasil diperbarui.`);
  };

  const handleToggleAvailable = (productId: string, currentStatus: boolean) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, isAvailable: !currentStatus } : p
      )
    );
    showNotification(
      `Status menu diubah menjadi ${!currentStatus ? 'Tersedia' : 'Habis'}.`
    );
  };

  // ----------------------------------------------------
  // LOGIKA KATEGORI MENU
  // ----------------------------------------------------

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (catData: {
    _id?: string;
    name: string;
    slug: string;
  }) => {
    if (catData._id) {
      setCategories((prev) =>
        prev.map((c) =>
          c._id === catData._id
            ? { ...c, name: catData.name, slug: catData.slug }
            : c
        )
      );
      setProducts((prev) =>
        prev.map((p) =>
          p.categoryId === catData._id
            ? {
                ...p,
                category: { _id: catData._id!, name: catData.name, slug: catData.slug },
              }
            : p
        )
      );
      showNotification(`Berhasil memperbarui kategori: "${catData.name}".`);
    } else {
      const newCategory: Category = {
        _id: `cat-${Date.now()}`,
        name: catData.name,
        slug: catData.slug,
      };
      setCategories((prev) => [...prev, newCategory]);
      showNotification(`Berhasil membuat kategori baru: "${catData.name}".`);
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const productsInCat = products.filter((p) => p.categoryId === categoryId);
    if (productsInCat.length > 0) {
      alert(
        `Kategori "${categoryName}" tidak bisa dihapus karena masih digunakan oleh ${productsInCat.length} menu.`
      );
      return;
    }

    const confirmDel = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`
    );
    if (!confirmDel) return;

    setCategories((prev) => prev.filter((c) => c._id !== categoryId));
    showNotification(`Kategori "${categoryName}" berhasil dihapus.`);
  };

  // ----------------------------------------------------
  // FILTER PRODUK
  // ----------------------------------------------------

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div className="relative p-4 md:p-8 space-y-8">
      
      {/* Notifikasi Toast Mengambang */}
      {notifMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-[#4B3832] text-[#FFFDF7] px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 border border-[#6F4E37]">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#DCC7AA] text-[#4B3832] font-bold text-xs">✓</span>
            <span className="font-semibold text-sm">{notifMessage}</span>
          </div>
        </div>
      )}

      {/* Header Halaman & Tab Kapsul */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Tab Switcher (Modern Pill Style) */}
        <div className="inline-flex bg-[#FFFDF7] p-1.5 rounded-2xl shadow-sm border border-[#DCC7AA]">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            data-state={activeTab === 'products' ? 'active' : 'inactive'}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'products'
                ? 'bg-[#F5E6CA] text-[#4B3832] shadow-sm'
                : 'text-[#6F4E37] hover:text-[#4B3832]'
            }`}
          >
            Data Menu ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            data-state={activeTab === 'categories' ? 'active' : 'inactive'}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              activeTab === 'categories'
                ? 'bg-[#F5E6CA] text-[#4B3832] shadow-sm'
                : 'text-[#6F4E37] hover:text-[#4B3832]'
            }`}
          >
            Kategori ({categories.length})
          </button>
        </div>

        {/* Tombol CTA (Hanya untuk Kategori di sini) */}
        <div>
          {activeTab === 'categories' && (
            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#6F4E37] hover:bg-[#4B3832] text-[#FFFDF7] font-bold text-sm px-6 py-3 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-[#4B3832]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              <span>Tambah Kategori</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: MANAJEMEN MENU MAKANAN & MINUMAN               */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Stat Cards Filter Kategori */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`p-5 rounded-3xl text-left transition-all border shadow-sm flex flex-col justify-between group ${
                selectedCategoryFilter === 'all'
                  ? 'bg-[#4B3832] border-[#4B3832]'
                  : 'bg-[#FFFDF7] border-[#DCC7AA]/60 hover:border-[#6F4E37]'
              }`}
            >
              <span className={`font-bold text-sm mb-2 ${selectedCategoryFilter === 'all' ? 'text-[#FFFDF7]' : 'text-[#6F4E37]'}`}>Semua Menu</span>
              <span className={`text-3xl font-black ${selectedCategoryFilter === 'all' ? 'text-[#FFFDF7]' : 'text-[#4B3832]'}`}>{products.length}</span>
            </button>

            {categories.slice(0, 3).map((cat) => {
              const count = products.filter((p) => p.categoryId === cat._id).length;
              const isActive = selectedCategoryFilter === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat._id)}
                  className={`p-5 rounded-3xl text-left transition-all border shadow-sm flex flex-col justify-between group ${
                    isActive
                      ? 'bg-[#4B3832] border-[#4B3832]'
                      : 'bg-[#FFFDF7] border-[#DCC7AA]/60 hover:border-[#6F4E37]'
                  }`}
                >
                  <span className={`font-bold text-sm mb-2 ${isActive ? 'text-[#FFFDF7]' : 'text-[#6F4E37]'}`}>{cat.name}</span>
                  <span className={`text-3xl font-black ${isActive ? 'text-[#FFFDF7]' : 'text-[#4B3832]'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Toolbar Tabel (Pencarian & Tambah Menu) */}
          <div className="bg-[#FFFDF7] p-4 rounded-t-3xl border border-[#DCC7AA] border-b-0 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80 relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DCC7AA] group-focus-within:text-[#6F4E37] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama menu..."
                className="w-full bg-[#FFFDF7] border border-[#DCC7AA] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] rounded-full pl-12 pr-4 py-2.5 font-semibold text-sm text-[#4B3832] outline-none transition-all shadow-inner"
              />
            </div>
            
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#6F4E37] hover:bg-[#4B3832] text-[#FFFDF7] font-bold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow-md transition-colors border border-[#4B3832]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              <span>Tambah Menu</span>
            </button>
          </div>

          {/* Tabel / Daftar Produk */}
          <div className="bg-[#FFFDF7] rounded-b-3xl shadow-sm border border-[#DCC7AA] overflow-hidden -mt-6">
            <ProductTable
              products={filteredProducts}
              onEditProduct={handleOpenEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
              onToggleAvailable={handleToggleAvailable}
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: MANAJEMEN KATEGORI MENU                       */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {categories.map((cat) => {
            const productCount = products.filter((p) => p.categoryId === cat._id).length;
            return (
              <div
                key={cat._id}
                className="bg-[#FFFDF7] rounded-3xl border border-[#DCC7AA] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-6"
              >
                <div>
                  <span className="inline-block text-[10px] font-black text-[#4B3832] uppercase px-2.5 py-1 rounded-full bg-[#F5E6CA] mb-4">
                    #{cat.slug}
                  </span>
                  <h3 className="text-xl font-bold text-[#4B3832] leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-sm font-medium text-[#6F4E37] mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                    Terdiri dari <strong className="text-[#4B3832] font-bold">{productCount} menu</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#DCC7AA]">
                  <button
                    type="button"
                    onClick={() => handleOpenEditCategory(cat)}
                    className="flex-1 bg-[#FFFDF7] hover:bg-[#F5E6CA] text-[#6F4E37] font-bold py-2.5 rounded-xl border border-[#DCC7AA] hover:border-[#6F4E37] transition-colors text-xs"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="flex-1 bg-[#fef2f2] hover:bg-[#fecaca] text-[#ef4444] font-bold py-2.5 rounded-xl border border-transparent transition-colors text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Produk */}
      <ProductModal
        isOpen={isProductModalOpen}
        initialData={editingProduct}
        categories={categories}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Modal Tambah / Edit Kategori */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        initialData={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
}
