// src/app/reservasi/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function ReservationPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    pax: '2',
    notes: ''
  });

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
    Promise.all([
      fetch('/api/admin/products').then(res => res.json()),
      fetch('/api/settings').then(res => res.json())
    ]).then(([productsData, settingsData]) => {
      if(Array.isArray(productsData)) setProducts(productsData.filter(p => p.isAvailable));
      setSettings(settingsData);
    }).catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const dpAmount = cartTotal / 2;

  const handleNextToMenu = () => {
    if (!formData.name || !formData.date || !formData.time || !formData.pax) {
      alert("Mohon lengkapi Nama, Tanggal, Waktu, dan Jumlah Orang terlebih dahulu!");
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextToInvoice = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleWhatsAppCheckout = async () => {
    setIsCheckoutLoading(true);
    let phone = settings?.reservation?.whatsappNumber || settings?.receipt?.phone || '081234567890';
    // Bersihkan semua karakter non-angka
    phone = phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.substring(1);
    }

    // Persiapkan item keranjang untuk DraftOrder
    const draftItems = Object.entries(cart).map(([id, qty]) => {
      const p = products.find(prod => prod._id === id);
      return {
        product: id,
        quantity: qty,
        price: p ? p.price : 0
      };
    }).filter(item => item.price > 0);

    let shortCode = '';
    
    // Call API Draft Order
    try {
      const res = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          tableNumber: '', // Kosongkan, nanti diisi kasir
          items: draftItems
        })
      });
      const data = await res.json();
      if (data.success && data.shortCode) {
        shortCode = data.shortCode;
      }
    } catch (err) {
      console.error('Gagal membuat draft order', err);
    }

    let message = `Halo Dapoer Thatha, saya ingin melakukan Reservasi Meja:\n\n`;
    if (shortCode) {
      message += `*KODE RESERVASI: ${shortCode}*\n`;
      message += `_(Tunjukkan kode ini ke kasir)_\n\n`;
    }
    message += `*Nama:* ${formData.name}\n`;
    message += `*Tanggal:* ${formData.date}\n`;
    message += `*Waktu:* ${formData.time}\n`;
    message += `*Jumlah Tamu:* ${formData.pax} Orang\n`;
    if (formData.notes) {
      message += `*Catatan Tambahan:* ${formData.notes}\n`;
    }
    
    if (Object.keys(cart).length > 0) {
      message += `\n*-- PRE-ORDER MENU --*\n`;
      Object.entries(cart).forEach(([id, qty]) => {
        const p = products.find(prod => prod._id === id);
        if (p) {
          const subtotal = p.price * qty;
          message += `- ${qty}x ${p.name} (Rp ${subtotal.toLocaleString('id-ID')})\n`;
        }
      });
      message += `\n*Total Pesanan:* Rp ${cartTotal.toLocaleString('id-ID')}\n`;
      message += `*Wajib DP 50%: Rp ${dpAmount.toLocaleString('id-ID')}*\n`;
    } else {
      message += `\n*(Belum ada pre-order menu, pesan di tempat)*\n`;
    }

    message += `\nMohon info ketersediaan mejanya. Terima kasih!`;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setIsCheckoutLoading(false);
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
            <Link href="/" className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 border transition-colors ${
              isDarkMode ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3] hover:text-[#111]' : 'border-[#4B3832] hover:bg-[#4B3832] hover:text-[#FFFDF7]'
            }`}>
              Batal
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER & STEPPER SECTION */}
      <div className="pt-32 pb-8 px-6 max-w-3xl mx-auto text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-4">RESERVASI & PRE-ORDER</p>
        <h1 className="text-3xl md:text-5xl font-serif font-light mb-8">
          {step === 1 && "Detail Kedatangan"}
          {step === 2 && "Pilih Menu"}
          {step === 3 && "Review & Tagihan"}
        </h1>

        {/* Stepper UI */}
        <div className="flex items-center justify-center max-w-sm mx-auto mb-4">
          <div className="flex items-center w-full">
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 1 ? (isDarkMode ? 'bg-[#e5d3b3] text-[#111]' : 'bg-[#4B3832] text-white') : (isDarkMode ? 'bg-[#1a1a1a] text-[#e5d3b3]/30 border border-[#e5d3b3]/10' : 'bg-transparent border border-[#DCC7AA] text-[#DCC7AA]')}`}>1</div>
            <div className={`flex-1 h-px transition-colors ${step >= 2 ? (isDarkMode ? 'bg-[#e5d3b3]' : 'bg-[#4B3832]') : (isDarkMode ? 'bg-[#e5d3b3]/10' : 'bg-[#DCC7AA]/40')}`}></div>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 2 ? (isDarkMode ? 'bg-[#e5d3b3] text-[#111]' : 'bg-[#4B3832] text-white') : (isDarkMode ? 'bg-[#1a1a1a] text-[#e5d3b3]/30 border border-[#e5d3b3]/10' : 'bg-transparent border border-[#DCC7AA] text-[#DCC7AA]')}`}>2</div>
            <div className={`flex-1 h-px transition-colors ${step >= 3 ? (isDarkMode ? 'bg-[#e5d3b3]' : 'bg-[#4B3832]') : (isDarkMode ? 'bg-[#e5d3b3]/10' : 'bg-[#DCC7AA]/40')}`}></div>
            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= 3 ? (isDarkMode ? 'bg-[#e5d3b3] text-[#111]' : 'bg-[#4B3832] text-white') : (isDarkMode ? 'bg-[#1a1a1a] text-[#e5d3b3]/30 border border-[#e5d3b3]/10' : 'bg-transparent border border-[#DCC7AA] text-[#DCC7AA]')}`}>3</div>
          </div>
        </div>
        <div className="flex items-center justify-between max-w-[26rem] mx-auto text-[10px] uppercase font-bold tracking-widest opacity-60 px-2">
          <span>Data Diri</span>
          <span>Menu</span>
          <span>Invoice</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* STEP 1: FORM RESERVASI */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className={`p-8 md:p-10 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-[#1a1a1a] border-[#e5d3b3]/10' : 'bg-white border-[#DCC7AA]/70'}`}>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nama Lengkap / Perwakilan</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="contoh: Budi Santoso" className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3] focus:ring-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832] focus:ring-[#4B3832]'}`} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Tanggal Kedatangan</label>
                    <input type="date" name="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleInputChange} className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832]'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Waktu Kedatangan</label>
                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832]'}`} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Jumlah Orang (Pax)</label>
                  <input type="number" name="pax" min="1" value={formData.pax} onChange={handleInputChange} className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832]'}`} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Catatan Khusus (Opsional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="contoh: Minta meja di area no-smoking, ada anak kecil, dsb." rows={3} className={`w-full bg-transparent border rounded-2xl px-4 py-4 outline-none focus:ring-1 transition-all resize-none ${isDarkMode ? 'border-[#e5d3b3]/30 focus:border-[#e5d3b3]' : 'border-[#DCC7AA] focus:border-[#4B3832]'}`} />
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button 
                  onClick={handleNextToMenu}
                  className={`w-full md:w-auto px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-colors shadow-lg ${isDarkMode ? 'bg-[#e5d3b3] text-[#111] hover:bg-white' : 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'}`}
                >
                  Lanjut Pilih Menu &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: KATALOG MENU */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
             {/* Kategori Filter */}
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

        {/* STEP 3: REVIEW & INVOICE */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
             <div className={`rounded-3xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border-[#e5d3b3]/10' : 'bg-white border-[#DCC7AA]/70'}`}>
                
                {/* INVOICE HEADER */}
                <div className={`p-8 text-center border-b ${isDarkMode ? 'bg-[#222] border-[#e5d3b3]/10' : 'bg-[#F5E6CA] border-[#DCC7AA]/50'}`}>
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Invoice Reservasi</p>
                  <h2 className="text-3xl font-serif font-bold">Dapoer Thatha</h2>
                </div>

                <div className="p-8 space-y-8">
                  {/* DATA DIRI SUMARRY */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Nama Pemesan</p>
                        <p className="font-bold">{formData.name}</p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Jumlah Orang</p>
                        <p className="font-bold">{formData.pax} Pax</p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Tanggal</p>
                        <p className="font-bold">{formData.date}</p>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Waktu</p>
                        <p className="font-bold">{formData.time}</p>
                     </div>
                  </div>

                  {formData.notes && (
                     <div className={`p-4 rounded-xl text-sm italic ${isDarkMode ? 'bg-black/20' : 'bg-[#F5E6CA]/30'}`}>
                        &quot;{formData.notes}&quot;
                     </div>
                  )}

                  {/* PESANAN SUMMARY */}
                  <div className="pt-6 border-t border-dashed border-gray-500/30">
                    <h3 className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-4">Rincian Pre-Order</h3>
                    
                    {Object.keys(cart).length === 0 ? (
                      <p className="text-sm italic opacity-60 text-center py-4">Belum ada menu yang dipilih. Anda bisa memesan di tempat.</p>
                    ) : (
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
                           <div className="flex justify-between items-start sm:items-center text-sm font-bold opacity-80 mb-2 gap-4">
                              <span>Total Harga Menu</span>
                              <span className="whitespace-nowrap flex-shrink-0">Rp {cartTotal.toLocaleString('id-ID')}</span>
                           </div>
                           <div className="flex justify-between items-start sm:items-center text-lg font-black text-amber-500 gap-4">
                              <span>Total Wajib DP (50%)</span>
                              <span className="whitespace-nowrap flex-shrink-0">Rp {dpAmount.toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`p-6 border-t flex flex-col sm:flex-row gap-4 ${isDarkMode ? 'bg-[#222] border-[#e5d3b3]/10' : 'bg-[#F5E6CA]/50 border-[#DCC7AA]/50'}`}>
                  <button onClick={() => setStep(2)} className={`flex-1 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors border ${isDarkMode ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3]/10' : 'border-[#4B3832]/50 hover:bg-[#4B3832]/5'}`}>
                    Edit Pesanan
                  </button>
                  <button disabled={isCheckoutLoading} onClick={handleWhatsAppCheckout} className={`flex-1 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-lg ${isDarkMode ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'} ${isCheckoutLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isCheckoutLoading ? (
                      'Memproses...'
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Kirim via WhatsApp
                      </>
                    )}
                  </button>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* STICKY BOTTOM BAR ONLY FOR STEP 2 (CATALOG) */}
      {step === 2 && (
        <div className={`fixed bottom-0 left-0 w-full z-40 border-t transition-all duration-300 animate-in slide-in-from-bottom-full ${
          isDarkMode ? 'bg-[#111111]/90 backdrop-blur-xl border-[#e5d3b3]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/90 backdrop-blur-xl border-[#DCC7AA] shadow-[0_-10px_40px_rgba(75,56,50,0.1)]'
        }`}>
           <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
              <button onClick={() => setStep(1)} className={`hidden md:block px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors border ${isDarkMode ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3]/10' : 'border-[#4B3832]/50 hover:bg-[#4B3832]/5'}`}>
                &larr; Kembali
              </button>
              
              <div className="flex-1 flex items-center justify-between md:justify-end md:gap-8">
                 <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-0.5">{cartItemsCount} Menu Terpilih</p>
                    <p className="text-xl font-black">Rp {cartTotal.toLocaleString('id-ID')}</p>
                 </div>
                 
                 <button 
                  onClick={handleNextToInvoice}
                  className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-colors shadow-lg ${
                    isDarkMode ? 'bg-[#e5d3b3] text-[#111] hover:bg-white' : 'bg-[#4B3832] text-white hover:bg-[#6F4E37]'
                  }`}
                >
                  Lihat Invoice &rarr;
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
