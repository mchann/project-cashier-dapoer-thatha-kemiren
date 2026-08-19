// src/app/menu/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';



export default function PublicMenuPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/products')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
           setProducts(data.filter(p => p.isAvailable));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Toggle Theme Function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Set initial class based on state
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const uniqueCategories = Array.from(new Set(products.map(p => p.category?.name || p.category || 'UMUM')));
  const categories = ['Semua', ...uniqueCategories];
  
  const filteredMenu = activeCategory === 'Semua' 
    ? products 
    : products.filter(m => (m.category?.name || m.category || 'UMUM') === activeCategory);

  return (
    <div className={`min-h-screen transition-colors duration-500 pb-20 ${
      isDarkMode 
        ? 'bg-[#111111] text-[#e5d3b3]' 
        : 'bg-[#FFFDF7] text-[#4B3832]'
    }`}>
      
      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 border-b ${
        isDarkMode 
          ? 'bg-[#111111]/80 backdrop-blur-md border-[#e5d3b3]/10' 
          : 'bg-[#FFFDF7]/80 backdrop-blur-md border-[#DCC7AA]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl md:text-2xl font-serif tracking-widest font-semibold hover:opacity-80 transition-opacity">
            Dapoer Thatha
          </Link>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors ${
                isDarkMode 
                  ? 'border-[#e5d3b3]/30 hover:border-[#e5d3b3] text-[#e5d3b3]' 
                  : 'border-[#DCC7AA] hover:border-[#4B3832] text-[#6F4E37]'
              }`}
              title="Ganti Tema Warna"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <Link 
              href="/"
              className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 border transition-colors ${
                isDarkMode 
                  ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3] hover:text-[#111]' 
                  : 'border-[#4B3832] hover:bg-[#4B3832] hover:text-[#FFFDF7]'
              }`}
            >
              Kembali
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER SECTION */}
      <div className="pt-32 pb-12 px-6 max-w-7xl mx-auto text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-4">KATALOG LENGKAP</p>
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-8">Menu Kami</h1>
        
        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                  isActive 
                    ? isDarkMode 
                      ? 'bg-[#e5d3b3] text-[#111] border-[#e5d3b3]' 
                      : 'bg-[#4B3832] text-[#FFFDF7] border-[#4B3832]'
                    : isDarkMode
                      ? 'bg-transparent text-[#e5d3b3]/70 border-[#e5d3b3]/30 hover:border-[#e5d3b3]'
                      : 'bg-transparent text-[#6F4E37] border-[#DCC7AA] hover:border-[#4B3832]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* MENU GRID */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredMenu.map((item) => (
            <div key={item._id || item.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className={`relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 border ${
                isDarkMode ? 'border-[#e5d3b3]/10' : 'border-[#DCC7AA]'
              }`}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              {/* Info */}
              <div className="text-center">
                <p className={`text-[9px] uppercase tracking-widest mb-1 ${
                  isDarkMode ? 'text-[#e5d3b3]/60' : 'text-[#DCC7AA]'
                }`}>{item.category?.name || (typeof item.category === 'string' ? item.category : 'UMUM')}</p>
                <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                <p className={`font-medium ${
                  isDarkMode ? 'text-[#e5d3b3]' : 'text-[#6F4E37]'
                }`}>{item.price ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : '-'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State jika filter kosong (meski mustahil krn data static, tapi good practice) */}
        {filteredMenu.length === 0 && (
          <div className="text-center py-20 opacity-50">
            Tidak ada menu dalam kategori ini.
          </div>
        )}
      </div>

    </div>
  );
}
