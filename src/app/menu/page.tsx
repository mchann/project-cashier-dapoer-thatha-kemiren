// src/app/menu/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock Data untuk Menu Lengkap
const MENU_ITEMS = [
  { id: 1, category: 'Makanan', name: 'Pecel Pitik Kemiren', price: 'Rp 45.000', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=600&auto=format&fit=crop' },
  { id: 2, category: 'Makanan', name: 'Uyah Asem Ayam', price: 'Rp 35.000', image: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?q=80&w=600&auto=format&fit=crop' },
  { id: 3, category: 'Makanan', name: 'Nasi Tempong Biasa', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?q=80&w=600&auto=format&fit=crop' },
  { id: 4, category: 'Makanan', name: 'Nasi Goreng Thatha', price: 'Rp 25.000', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop' },
  
  { id: 5, category: 'Minuman', name: 'Kopi Jaran Goyang', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop' },
  { id: 6, category: 'Minuman', name: 'Es Degan Gula Aren', price: 'Rp 12.000', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop' },
  { id: 7, category: 'Minuman', name: 'Wedang Uwuh', price: 'Rp 10.000', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=600&auto=format&fit=crop' },
  { id: 8, category: 'Minuman', name: 'Es Teh Manis', price: 'Rp 5.000', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop' },
  
  { id: 9, category: 'Snack', name: 'Kucur', price: 'Rp 10.000', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop' },
  { id: 10, category: 'Snack', name: 'Pisang Goreng Keju', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1596450514735-111a2fe02935?q=80&w=600&auto=format&fit=crop' },
  { id: 11, category: 'Snack', name: 'Tahu Walik', price: 'Rp 12.000', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop' },
];

export default function PublicMenuPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Semua');

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

  const categories = ['Semua', 'Makanan', 'Minuman', 'Snack'];
  const filteredMenu = activeCategory === 'Semua' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(m => m.category === activeCategory);

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
            <div key={item.id} className="group cursor-pointer">
              {/* Image Container */}
              <div className={`relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 border ${
                isDarkMode ? 'border-[#e5d3b3]/10' : 'border-[#DCC7AA]'
              }`}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Hover Overlay */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center ${
                  isDarkMode ? 'bg-black/40' : 'bg-[#F5E6CA]/40 backdrop-blur-[2px]'
                }`}>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 border rounded-full ${
                    isDarkMode ? 'text-white border-white' : 'text-[#4B3832] border-[#4B3832] bg-[#FFFDF7]/80'
                  }`}>
                    Lihat Detail
                  </span>
                </div>
              </div>
              
              {/* Info */}
              <div className="text-center">
                <p className={`text-[9px] uppercase tracking-widest mb-1 ${
                  isDarkMode ? 'text-[#e5d3b3]/60' : 'text-[#DCC7AA]'
                }`}>{item.category}</p>
                <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                <p className={`font-medium ${
                  isDarkMode ? 'text-[#e5d3b3]' : 'text-[#6F4E37]'
                }`}>{item.price}</p>
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
