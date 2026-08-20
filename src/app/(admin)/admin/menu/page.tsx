// src/app/(admin)/admin/menu/page.tsx
'use client';

import React, { useState } from 'react';
import { Category, Product } from '@/types/pos';
import { ProductTable } from '@/components/admin/ProductTable';
import { ProductModal } from '@/components/admin/ProductModal';
import { CategoryModal } from '@/components/admin/CategoryModal';

export default function AdminMenuPage() {
  // State Data Master (Kategori & Produk)
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

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

  // State Delete Modals
  const [isDeleteProductModalOpen, setIsDeleteProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);
  
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);

  // Notifikasi Aksi Owner
  const [notifMessage, setNotifMessage] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/categories')
      ]);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.filter((c: Category) => c.slug !== 'all'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProductModalOpen(false);
        setIsCategoryModalOpen(false);
        setIsDeleteProductModalOpen(false);
        setIsDeleteCategoryModalOpen(false);
      }
    };
    if (isProductModalOpen || isCategoryModalOpen || isDeleteProductModalOpen || isDeleteCategoryModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProductModalOpen, isCategoryModalOpen, isDeleteProductModalOpen, isDeleteCategoryModalOpen]);


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

    const handleSaveProduct = async (prodData: any) => {
    try {
      const url = prodData._id ? `/api/admin/products/${prodData._id}` : '/api/admin/products';
      const method = prodData._id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      });
      
      if (!res.ok) throw new Error('Gagal menyimpan menu');
      
      showNotification(`Berhasil ${prodData._id ? 'memperbarui' : 'menambahkan'} menu: "${prodData.name}".`);
      setIsProductModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

    const handleDeleteProduct = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setIsDeleteProductModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus menu');
      showNotification(`Menu "${productToDelete.name}" berhasil dihapus.`);
      setIsDeleteProductModalOpen(false);
      setProductToDelete(null);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

    const handleAdjustStock = async (productId: string, delta: number) => {
    try {
      const prod = products.find(p => p._id === productId);
      if (!prod) return;
      const newStock = Math.max(0, prod.stock + delta);
      
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prod, categoryId: prod.categoryId || prod.category?._id, stock: newStock, isAvailable: newStock > 0 ? prod.isAvailable : false }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui stok');
      showNotification('Stok berhasil diperbarui.');
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSetStock = async (productId: string, newStock: number) => {
    try {
      const prod = products.find(p => p._id === productId);
      if (!prod) return;
      if (newStock < 0) newStock = 0;
      
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prod, categoryId: prod.categoryId || prod.category?._id, stock: newStock, isAvailable: newStock > 0 ? prod.isAvailable : false }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui stok');
      showNotification('Stok berhasil diperbarui.');
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

    const handleToggleAvailable = async (productId: string, currentStatus: boolean) => {
    try {
      const prod = products.find(p => p._id === productId);
      if (!prod) return;
      
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...prod, categoryId: prod.categoryId || prod.category?._id, isAvailable: !currentStatus }),
      });
      if (!res.ok) throw new Error('Gagal memperbarui status');
      showNotification(`Status menu diubah menjadi ${!currentStatus ? 'Tersedia' : 'Habis'}.`);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
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

  const handleSaveCategory = async (catData: { _id?: string; name: string; slug: string }) => {
    try {
      const url = catData._id ? `/api/admin/categories/${catData._id}` : '/api/admin/categories';
      const method = catData._id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menyimpan kategori');
      }
      
      showNotification(`Berhasil ${catData._id ? 'memperbarui' : 'menambahkan'} kategori: "${catData.name}".`);
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setIsDeleteCategoryModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus kategori');
      showNotification(`Kategori "${categoryToDelete.name}" berhasil dihapus.`);
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
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
              onSetStock={handleSetStock}
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

      {/* Delete Product Confirmation Modal */}
      {isDeleteProductModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => { setIsDeleteProductModalOpen(false); setProductToDelete(null); }}
        >
          <div 
            className="bg-[#FFFDF7] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#DCC7AA] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-[#4B3832] mb-2">Hapus Menu?</h3>
              <p className="text-sm text-[#6F4E37] font-medium mb-6">
                Apakah Anda yakin ingin menghapus menu <strong>"{productToDelete?.name}"</strong>?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsDeleteProductModalOpen(false); setProductToDelete(null); }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteProduct}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-600/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {isDeleteCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => { setIsDeleteCategoryModalOpen(false); setCategoryToDelete(null); }}
        >
          <div 
            className="bg-[#FFFDF7] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#DCC7AA] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-[#4B3832] mb-2">Hapus Kategori?</h3>
              <p className="text-sm text-[#6F4E37] font-medium mb-6">
                Apakah Anda yakin ingin menghapus kategori <strong>"{categoryToDelete?.name}"</strong>?<br/>
                <span className="text-xs mt-2 block text-red-500 font-bold">(Menu di dalam kategori ini bisa kehilangan referensinya)</span>
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsDeleteCategoryModalOpen(false); setCategoryToDelete(null); }}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDeleteCategory}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-red-600/20"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
