'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RawMaterial {
  _id: string;
  name: string;
  stock: number;
  unit: string;
  linkedProductsCount: number;
}

interface Product {
  _id: string;
  name: string;
  rawMaterialId?: string | null;
  isUnlimited?: boolean;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State untuk Bahan Baku
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', stock: '', unit: 'porsi' });
  
  // Modal State untuk Hapus Bahan Baku
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<RawMaterial | null>(null);

  // Modal State untuk Link Menu
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<RawMaterial | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/admin/raw-materials');
      const data = await res.json();
      if(Array.isArray(data)) setMaterials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if(Array.isArray(data)) setAllProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.stock || !formData.unit) return;

    try {
      const url = editingId ? `/api/admin/raw-materials/${editingId}` : '/api/admin/raw-materials';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', stock: '', unit: 'porsi' });
        fetchMaterials();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menyimpan bahan baku');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!materialToDelete) return;
    try {
      const res = await fetch(`/api/admin/raw-materials/${materialToDelete._id}`, { method: 'DELETE' });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setMaterialToDelete(null);
        fetchMaterials();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal menghapus');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStockQuick = async (id: string, amount: number) => {
    const mat = materials.find(m => m._id === id);
    if (!mat) return;
    const newStock = Math.max(0, mat.stock + amount);
    if (newStock === mat.stock) return;

    try {
      // Optimistic update
      setMaterials(materials.map(m => m._id === id ? { ...m, stock: newStock } : m));
      
      const res = await fetch(`/api/admin/raw-materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...mat, stock: newStock })
      });
      if (!res.ok) {
        fetchMaterials(); // revert on error
      }
    } catch (error) {
      console.error(error);
      fetchMaterials();
    }
  };

  const openLinkModal = (material: RawMaterial) => {
    setActiveMaterial(material);
    const linked = allProducts.filter(p => p.rawMaterialId && typeof p.rawMaterialId === 'object' ? (p.rawMaterialId as any)._id === material._id : p.rawMaterialId === material._id);
    setLinkedProducts(linked);
    setMenuSearchQuery('');
    setSelectedProductId('');
    setIsMenuDropdownOpen(false);
    setIsLinkModalOpen(true);
  };

  const handleLinkProduct = async () => {
    if (!selectedProductId || !activeMaterial) return;
    
    // Temukan produk yang akan diupdate
    const product = allProducts.find(p => p._id === selectedProductId);
    if (!product) return;

    try {
      // Kita panggil API update produk untuk mengeset rawMaterialId
      const res = await fetch(`/api/admin/products/${selectedProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, rawMaterialId: activeMaterial._id })
      });
      if (res.ok) {
        setSelectedProductId('');
        setMenuSearchQuery('');
        await fetchProducts(); // Refresh list produk
        // Update state lokal modal
        setLinkedProducts([...linkedProducts, product]);
        fetchMaterials(); // Update count di background
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlinkProduct = async (productId: string) => {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, rawMaterialId: null })
      });
      if (res.ok) {
        await fetchProducts();
        setLinkedProducts(linkedProducts.filter(p => p._id !== productId));
        fetchMaterials();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const unlinkedProducts = allProducts.filter(p => !p.rawMaterialId && !p.isUnlimited);

  return (
    <div className="p-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4B3832]">Kelola Stok Bahan Baku</h1>
          <p className="text-[#6F4E37] font-medium mt-1">Pusat stok fisik. Menu di kasir akan mengambil stok dari sini.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', stock: '', unit: 'porsi' });
            setIsModalOpen(true);
          }}
          className="bg-[#4B3832] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-[#6F4E37] transition-colors shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Tambah Bahan Baku
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500 font-bold">Memuat data...</div>
      ) : materials.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-[#DCC7AA] text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto text-[#DCC7AA] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          <h3 className="text-xl font-black text-[#4B3832] mb-2">Belum Ada Bahan Baku</h3>
          <p className="text-[#6F4E37] mb-6">Tambahkan bahan baku (seperti Ayam, Ikan, Kerupuk) untuk mengatur stok menu Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(mat => (
            <div key={mat._id} className="bg-white rounded-3xl p-6 border border-[#DCC7AA] shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xl font-black text-[#4B3832]">{mat.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => {
                    setEditingId(mat._id);
                    setFormData({ name: mat.name, stock: mat.stock.toString(), unit: mat.unit });
                    setIsModalOpen(true);
                  }} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button onClick={() => {
                    setMaterialToDelete(mat);
                    setIsDeleteModalOpen(true);
                  }} className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-end gap-4 mb-6 relative z-10">
                <div className="flex items-end gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${mat.stock <= 5 ? 'text-red-500 animate-pulse' : 'text-[#4B3832]'}`}>
                    {mat.stock}
                  </span>
                  <span className="text-[#6F4E37] font-bold mb-1 uppercase tracking-wider text-sm">{mat.unit}</span>
                </div>
                <div className="flex gap-2 mb-1.5">
                  <button 
                    onClick={() => updateStockQuick(mat._id, -1)} 
                    disabled={mat.stock <= 0} 
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FFFDF7] text-[#6F4E37] border border-[#DCC7AA] hover:bg-[#F5E6CA] hover:border-[#4B3832] disabled:opacity-50 transition-colors shadow-sm font-black text-xl leading-none"
                    title="Kurangi Stok"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => updateStockQuick(mat._id, 1)} 
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FFFDF7] text-[#6F4E37] border border-[#DCC7AA] hover:bg-[#F5E6CA] hover:border-[#4B3832] transition-colors shadow-sm font-black text-xl leading-none"
                    title="Tambah Stok"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCC7AA]/50 flex justify-between items-center relative z-10">
                <button 
                  onClick={() => setExpandedCardId(expandedCardId === mat._id ? null : mat._id)}
                  className="text-xs font-bold text-[#6F4E37] px-3 py-1.5 bg-[#F5E6CA] hover:bg-[#DCC7AA] transition-colors rounded-full flex items-center gap-1.5"
                >
                  {mat.linkedProductsCount} Menu Tertaut
                  <svg className={`w-3.5 h-3.5 transition-transform ${expandedCardId === mat._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <button 
                  onClick={() => openLinkModal(mat)}
                  className="text-xs font-bold text-[#4B3832] hover:text-[#6F4E37] underline decoration-[#DCC7AA] underline-offset-4 flex items-center gap-1"
                >
                  + Tambah Menu Tertaut
                </button>
              </div>

              {expandedCardId === mat._id && (
                <div className="mt-4 pt-4 border-t border-dashed border-[#DCC7AA]/50 relative z-10 animate-in slide-in-from-top-2">
                  <h4 className="text-[11px] font-black text-[#6F4E37] mb-2 uppercase tracking-widest">Detail Menu Tertaut:</h4>
                  {allProducts.filter(p => p.rawMaterialId && typeof p.rawMaterialId === 'object' ? (p.rawMaterialId as any)._id === mat._id : p.rawMaterialId === mat._id).length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {allProducts.filter(p => p.rawMaterialId && typeof p.rawMaterialId === 'object' ? (p.rawMaterialId as any)._id === mat._id : p.rawMaterialId === mat._id).map(p => (
                        <div key={p._id} className="flex justify-between items-center text-sm bg-[#FFFDF7] p-2.5 rounded-lg border border-[#DCC7AA]/60 shadow-sm">
                          <span className="font-bold text-[#4B3832] truncate pr-2">{p.name}</span>
                          <span className="text-[#6F4E37] font-bold text-xs shrink-0 bg-[#F5E6CA] px-2 py-1 rounded">
                            Stok: {mat.stock}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic bg-[#FFFDF7] p-3 rounded-lg border border-dashed border-[#DCC7AA]">Belum ada menu tertaut.</p>
                  )}
                </div>
              )}

              <div className="absolute -bottom-6 -right-6 text-[#F5E6CA] opacity-30 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FFFDF7] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-[#DCC7AA] animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCC7AA] flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-[#4B3832]">{editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#6F4E37] mb-2">Nama Bahan Baku</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Misal: Ayam" className="w-full bg-white border border-[#DCC7AA] rounded-xl px-4 py-3 text-[#4B3832] font-bold focus:outline-none focus:border-[#4B3832] focus:ring-1 focus:ring-[#4B3832]" />
              </div>
              <div className="flex gap-4">
                {!editingId && (
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#6F4E37] mb-2">Stok Awal</label>
                    <input type="number" required min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="0" className="w-full bg-white border border-[#DCC7AA] rounded-xl px-4 py-3 text-[#4B3832] font-bold focus:outline-none focus:border-[#4B3832] focus:ring-1 focus:ring-[#4B3832]" />
                  </div>
                )}
                <div className={editingId ? "w-full" : "w-1/3"}>
                  <label className="block text-sm font-bold text-[#6F4E37] mb-2">Satuan</label>
                  <input type="text" required value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="potong" className="w-full bg-white border border-[#DCC7AA] rounded-xl px-4 py-3 text-[#4B3832] font-bold focus:outline-none focus:border-[#4B3832] focus:ring-1 focus:ring-[#4B3832]" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-[#6F4E37] bg-[#F5E6CA] hover:bg-[#DCC7AA] transition-colors">Batal</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-[#4B3832] hover:bg-[#6F4E37] transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Menu Tertaut */}
      {isLinkModalOpen && activeMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#FFFDF7] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#DCC7AA] flex flex-col max-h-[85vh] animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[#DCC7AA] flex justify-between items-center bg-white sticky top-0">
              <div>
                <h2 className="text-xl font-black text-[#4B3832]">Menu Tertaut</h2>
                <p className="text-sm font-bold text-[#6F4E37]">Bahan: <span className="text-[#4B3832] uppercase">{activeMaterial.name}</span></p>
              </div>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <div className="p-6 overflow-y-auto min-h-[400px]">
              <div className="mb-6 bg-white p-4 rounded-2xl border border-[#DCC7AA] shadow-sm">
                <label className="block text-sm font-bold text-[#6F4E37] mb-2">Tambahkan Menu ke Bahan Ini</label>
                <div className="flex gap-2">
                  <div className="relative flex-1" ref={dropdownRef}>
                    <input 
                      type="text" 
                      placeholder="Cari Menu Tanpa Bahan..." 
                      value={menuSearchQuery} 
                      onChange={e => {
                        setMenuSearchQuery(e.target.value);
                        setIsMenuDropdownOpen(true);
                        if (selectedProductId) setSelectedProductId('');
                      }}
                      onFocus={() => setIsMenuDropdownOpen(true)}
                      className="w-full bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl px-4 py-2.5 text-[#4B3832] font-bold outline-none focus:border-[#4B3832] focus:ring-1 focus:ring-[#4B3832]"
                    />
                    
                    {/* SVG Dropdown Arrow Icon */}
                    <div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#DCC7AA] pointer-events-none"
                    >
                      <svg className={`w-5 h-5 transition-transform ${isMenuDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>

                    {isMenuDropdownOpen && (
                      <div className="absolute z-20 w-full mt-2 bg-white border border-[#DCC7AA] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-h-60 overflow-y-auto overflow-x-hidden">
                        {unlinkedProducts.filter(p => p.name.toLowerCase().includes(menuSearchQuery.toLowerCase())).length > 0 ? (
                          unlinkedProducts.filter(p => p.name.toLowerCase().includes(menuSearchQuery.toLowerCase())).map(p => (
                            <button
                              key={p._id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(p._id);
                                setMenuSearchQuery(p.name);
                                setIsMenuDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm font-bold text-[#4B3832] hover:bg-[#F5E6CA] transition-colors border-b border-[#F5E6CA] last:border-b-0 focus:outline-none focus:bg-[#F5E6CA]"
                            >
                              {p.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-4 text-sm font-medium text-gray-500 text-center bg-[#FFFDF7]">
                            Menu tidak ditemukan
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleLinkProduct}
                    disabled={!selectedProductId}
                    className="bg-[#4B3832] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#6F4E37] disabled:opacity-50 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-[#6F4E37] mb-3 uppercase tracking-wider">Daftar Menu Tersambung</h4>
              {linkedProducts.length === 0 ? (
                <div className="text-center py-6 text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  Belum ada menu yang tertaut.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedProducts.map(p => (
                    <div key={p._id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[#DCC7AA] shadow-sm">
                      <span className="font-bold text-[#4B3832]">{p.name}</span>
                      <button 
                        onClick={() => handleUnlinkProduct(p._id)}
                        className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Lepas (Unlink)
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {isDeleteModalOpen && materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Hapus Bahan Baku?</h3>
              <p className="text-gray-500 mb-6 font-medium text-sm">Bahan baku <span className="font-bold text-gray-900">{materialToDelete.name}</span> akan dihapus permanen. Pastikan tidak ada menu yang tertaut.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
