// src/app/order/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function OrderPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Step 1: Browse, Step 2: Checkout Form, Step 3: Success Code
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shortCode, setShortCode] = useState('');

  // Cart State (ProductId -> Quantity)
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => cats.add(p.category?.name || p.category || 'UMUM'));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Semua') return products;
    return products.filter(p => (p.category?.name || p.category || 'UMUM') === selectedCategory);
  }, [products, selectedCategory]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProducts(data.filter(p => p.isAvailable));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
      
    // Parse table number from URL
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table');
    if (table) setTableNumber(table);
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      const newCart = { ...prev };
      if (next === 0) delete newCart[productId];
      else newCart[productId] = next;
      return newCart;
    });
  };

  const cartTotal = useMemo(() => {
    let total = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const p = products.find(prod => prod._id === id);
      if (p) total += p.price * qty;
    });
    return total;
  }, [cart, products]);

  const cartItemsCount = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  }, [cart]);

  const handleSubmitOrder = async () => {
    if (!customerName) {
      alert("Mohon masukkan nama pemesan terlebih dahulu.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const items = Object.entries(cart).map(([id, qty]) => {
        const p = products.find(prod => prod._id === id);
        return {
          product: id,
          quantity: qty,
          price: p?.price || 0
        };
      });

      const res = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, tableNumber, items })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setShortCode(data.shortCode);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-32 ${
      isDarkMode ? 'bg-[#111111] text-[#e5d3b3]' : 'bg-[#FFFDF7] text-[#4B3832]'
    }`}>
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${
        isDarkMode ? 'bg-[#111111]/80 backdrop-blur-md border-[#e5d3b3]/10' : 'bg-[#FFFDF7]/80 backdrop-blur-md border-[#DCC7AA]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest font-semibold hover:opacity-80 transition-opacity">
            Dapoer Thatha
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full border transition-colors ${
              isDarkMode ? 'border-[#e5d3b3]/30 hover:border-[#e5d3b3] text-[#e5d3b3]' : 'border-[#DCC7AA] hover:border-[#4B3832] text-[#6F4E37]'
            }`}>
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            {step < 3 && (
              <Link href="/" className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 border transition-colors ${
                isDarkMode ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3] hover:text-[#111]' : 'border-[#4B3832] hover:bg-[#4B3832] hover:text-[#FFFDF7]'
              }`}>
                Batal
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-8 px-6 max-w-7xl mx-auto text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-4">PESAN LANGSUNG</p>
        <h1 className="text-3xl md:text-5xl font-serif font-light mb-8">
          {step === 1 && "Katalog Menu"}
          {step === 2 && "Konfirmasi Pesanan"}
          {step === 3 && "Pesanan Tersimpan!"}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* STEP 1: BROWSE MENU */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
             {!isLoading && categories.length > 1 && (
              <div className="flex overflow-x-auto gap-2 pb-2 mb-6 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-6 py-3 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? (isDarkMode ? 'bg-[#e5d3b3] text-[#111]' : 'bg-[#4B3832] text-white')
                        : (isDarkMode ? 'bg-[#1a1a1a] text-[#e5d3b3]/70 border border-[#e5d3b3]/10 hover:bg-[#e5d3b3]/20' : 'bg-white text-[#6F4E37] border border-[#DCC7AA]/40 hover:bg-[#F5E6CA]')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-20 opacity-50">Memuat katalog menu...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(product => {
                  const qty = cart[product._id] || 0;
                  return (
                    <div key={product._id} className={`flex gap-4 p-4 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#1a1a1a] border-[#e5d3b3]/10 hover:border-[#e5d3b3]/30' : 'bg-white border-[#DCC7AA]/40 shadow-sm hover:border-[#DCC7AA]'}`}>
                       <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-2xl shrink-0 bg-gray-200" />
                       <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h3 className="font-bold text-sm leading-tight mb-1">{product.name}</h3>
                            <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-[#e5d3b3]/50' : 'text-[#6F4E37]'}`}>{product.category?.name || product.category || 'UMUM'}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-black">Rp {Number(product.price).toLocaleString('id-ID')}</span>
                            
                            {qty === 0 ? (
                               <button onClick={() => updateQuantity(product._id, 1)} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${isDarkMode ? 'bg-[#e5d3b3] text-[#111] hover:bg-white' : 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'}`}>Tambah</button>
                            ) : (
                               <div className="flex items-center gap-3 bg-[#4B3832] text-white rounded-xl p-1">
                                 <button onClick={() => updateQuantity(product._id, -1)} className="w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-lg transition-colors">-</button>
                                 <span className="text-xs font-bold min-w-[1ch] text-center">{qty}</span>
                                 <button onClick={() => updateQuantity(product._id, 1)} className="w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-lg transition-colors">+</button>
                               </div>
                            )}
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
             <div className={`p-8 md:p-10 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-[#1a1a1a] border-[#e5d3b3]/10' : 'bg-white border-[#DCC7AA]/70'}`}>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nama Pemesan</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama Anda" className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3] focus:ring-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832] focus:ring-[#4B3832]'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nomor Meja</label>
                    <input type="text" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Misal: 5 (Opsional)" className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3] focus:ring-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832] focus:ring-[#4B3832]'}`} />
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-500/30 pt-6">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-4">Rincian Pesanan</h3>
                  <div className="space-y-3">
                    {Object.entries(cart).map(([id, qty]) => {
                      const p = products.find(prod => prod._id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex justify-between items-start text-sm font-medium gap-4">
                          <span className="flex-1">{qty}x {p.name}</span>
                          <span className="whitespace-nowrap flex-shrink-0">Rp {(p.price * qty).toLocaleString('id-ID')}</span>
                        </div>
                      );
                    })}
                    
                    <div className="pt-4 mt-4 border-t border-gray-500/20">
                        <div className="flex justify-between items-center text-lg font-black text-amber-500">
                          <span>Total</span>
                          <span>Rp {cartTotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors border ${isDarkMode ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3]/10' : 'border-[#4B3832]/50 hover:bg-[#4B3832]/5'}`}
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-colors shadow-lg ${isDarkMode ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'}`}
                  >
                    {isSubmitting ? 'Memproses...' : 'Dapatkan Kode Pesanan'}
                  </button>
                </div>
             </div>
          </div>
        )}

        {/* STEP 3: SUCCESS CODE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-lg mx-auto text-center mt-10">
             <div className={`p-10 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#1a1a1a] border-amber-500/50' : 'bg-white border-amber-500'}`}>
                <div className="w-20 h-20 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-xl mb-2 opacity-80">Kode Pesanan Anda:</h2>
                <div className="text-6xl font-black tracking-[0.2em] text-amber-500 mb-6 drop-shadow-md">
                  {shortCode}
                </div>
                <p className="opacity-80 text-sm mb-8 leading-relaxed">
                  Tunjukkan atau sebutkan kode ini di kasir untuk memproses pembayaran dan pesanan Anda.
                </p>
                <Link href="/" className={`inline-block w-full py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors border ${isDarkMode ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3]/10' : 'border-[#4B3832]/50 hover:bg-[#4B3832]/5'}`}>
                  Kembali ke Beranda
                </Link>
             </div>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM BAR ONLY FOR STEP 1 */}
      {step === 1 && cartItemsCount > 0 && (
        <div className={`fixed bottom-0 left-0 w-full z-40 border-t transition-all duration-300 animate-in slide-in-from-bottom-full ${
          isDarkMode ? 'bg-[#111111]/90 backdrop-blur-xl border-[#e5d3b3]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/90 backdrop-blur-xl border-[#DCC7AA] shadow-[0_-10px_40px_rgba(75,56,50,0.1)]'
        }`}>
           <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center justify-between md:justify-end md:gap-8">
                 <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-0.5">{cartItemsCount} Menu Terpilih</p>
                    <p className="text-xl font-black">Rp {cartTotal.toLocaleString('id-ID')}</p>
                 </div>
                 
                 <button 
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-colors shadow-lg ${
                    isDarkMode ? 'bg-[#e5d3b3] text-[#111] hover:bg-white' : 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'
                  }`}
                >
                  Lanjut &rarr;
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
