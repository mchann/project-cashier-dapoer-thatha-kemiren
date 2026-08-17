// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Data Mockup untuk Manajemen Foto & Teks (Agar mudah diganti admin nantinya)
const LANDING_DATA = {
  heroImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2000&auto=format&fit=crop',
  philosophyImage: 'https://images.unsplash.com/photo-1577106263724-2c8e03bfeffe?q=80&w=1200&auto=format&fit=crop',
  signatureDishes: [
    {
      id: 1,
      category: 'HIDANGAN UTAMA',
      name: 'Pecel Pitik Kemiren',
      price: 'Rp 45.000',
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      category: 'KUAH KHAS',
      name: 'Uyah Asem Ayam',
      price: 'Rp 35.000',
      image: 'https://images.unsplash.com/photo-1548943487-a2e4f43b4850?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 3,
      category: 'MINUMAN TRADISIONAL',
      name: 'Kopi Jaran Goyang',
      price: 'Rp 15.000',
      image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=800&auto=format&fit=crop',
    },
  ],
  testimonials: [
    {
      id: 1,
      stars: 5,
      text: "Sebuah pengalaman kuliner Nusantara yang tak terlupakan. Setiap bumbu terasa otentik, suasana restorannya juga sangat nyaman dan hangat.",
      author: "ISABELLE FONTAINE, PARIS",
    },
    {
      id: 2,
      stars: 5,
      text: "Dapoer Thatha mendefinisikan ulang makna masakan rumahan. Pelayanannya luar biasa ramah, dan kopi khasnya benar-benar sempurna.",
      author: "JAMES WHITMORE, LONDON",
    },
    {
      id: 3,
      stars: 5,
      text: "Kami merayakan hari jadi di sini dan semuanya luar biasa sempurna. Mulai dari hidangan, suasana, hingga keramahtamahannya.",
      author: "CLARA & HENRI DUBOIS",
    },
  ]
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode (elegant)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
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
          <div className="text-xl md:text-2xl font-serif tracking-widest font-semibold">
            Dapoer Thatha
          </div>
          
          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium ${
            isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'
          }`}>
            <a href="#" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'} transition-colors`}>Beranda</a>
            <a href="#about" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'} transition-colors`}>Tentang Kami</a>
            <a href="#menu" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'} transition-colors`}>Menu</a>
            <a href="#testimonials" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'} transition-colors`}>Testimoni</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
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
              href="/login"
              className={`text-[10px] uppercase tracking-[0.2em] px-6 py-3 border transition-colors ${
                isDarkMode 
                  ? 'border-[#e5d3b3]/50 hover:bg-[#e5d3b3] hover:text-[#111]' 
                  : 'border-[#4B3832] hover:bg-[#4B3832] hover:text-[#FFFDF7]'
              }`}
            >
              Login
            </Link>
          </div>

          {/* Mobile Burger Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 w-full border-b flex flex-col items-center py-8 space-y-6 ${
            isDarkMode ? 'bg-[#111111] border-[#e5d3b3]/10' : 'bg-[#FFFDF7] border-[#DCC7AA]'
          }`}>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em]">Beranda</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em]">Tentang Kami</a>
            <a href="#menu" onClick={() => setIsMobileMenuOpen(false)} className="text-xs uppercase tracking-[0.2em]">Menu</a>
            <button onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }} className="text-xs uppercase tracking-[0.2em]">
              Mode: {isDarkMode ? 'Terang' : 'Gelap'}
            </button>
            <Link href="/login" className={`text-xs uppercase tracking-[0.2em] px-8 py-3 border ${
                isDarkMode ? 'border-[#e5d3b3]' : 'border-[#4B3832]'
            }`}>
              Login Staff
            </Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={LANDING_DATA.heroImage} 
            alt="Dapoer Thatha Kemiren" 
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${
            isDarkMode ? 'bg-black/70' : 'bg-[#F5E6CA]/60 backdrop-blur-sm'
          }`} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] mb-6">
            EST. 2024 • KULINER OTENTIK
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-light leading-tight mb-8">
            Simfoni Cita Rasa <br className="hidden md:block" />
            <span className={isDarkMode ? 'text-[#e5d3b3]' : 'text-[#6F4E37]'}>Nusantara dalam Setiap Suapan</span>
          </h1>
          <p className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] mb-12 max-w-xl mx-auto leading-loose">
            Perjalanan kuliner melalui warisan gastronomi Nusantara dan kekayaan rempah desa adat Kemiren.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="#menu" className={`text-xs uppercase tracking-[0.2em] px-8 py-4 transition-colors ${
              isDarkMode 
                ? 'bg-[#e5d3b3] text-[#111] hover:bg-white' 
                : 'bg-[#6F4E37] text-[#FFFDF7] hover:bg-[#4B3832]'
            }`}>
              Eksplorasi Menu
            </a>
            <a href="#testimonials" className={`text-xs uppercase tracking-[0.2em] px-8 py-4 border transition-colors ${
              isDarkMode 
                ? 'border-[#e5d3b3]/50 hover:border-[#e5d3b3]' 
                : 'border-[#4B3832] hover:bg-[#4B3832] hover:text-[#FFFDF7]'
            }`}>
              Reservasi Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={`py-24 border-b ${
        isDarkMode ? 'bg-[#18181b] border-[#e5d3b3]/10' : 'bg-[#F5E6CA] border-[#DCC7AA]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
          {/* Feature 1 */}
          <div className="relative">
            <div className={`absolute -top-12 right-0 text-5xl font-serif opacity-20 ${
              isDarkMode ? 'text-[#e5d3b3]' : 'text-[#6F4E37]'
            }`}>01</div>
            <div className={`w-12 h-[1px] mb-6 ${isDarkMode ? 'bg-[#e5d3b3]/30' : 'bg-[#6F4E37]/30'}`} />
            <h3 className="text-xl font-serif mb-4">Masakan Otentik</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              Setiap hidangan adalah mahakarya — diracik secara tradisional setiap hari menggunakan bumbu lokal pilihan dari petani sekitar.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="relative">
            <div className={`absolute -top-12 right-0 text-5xl font-serif opacity-20 ${
              isDarkMode ? 'text-[#e5d3b3]' : 'text-[#6F4E37]'
            }`}>02</div>
            <div className={`w-12 h-[1px] mb-6 ${isDarkMode ? 'bg-[#e5d3b3]/30' : 'bg-[#6F4E37]/30'}`} />
            <h3 className="text-xl font-serif mb-4">Reservasi Tempat</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              Cocok untuk perayaan keluarga, kumpul bersama, maupun pertemuan spesial dengan suasana yang hangat dan estetik.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="relative">
            <div className={`absolute -top-12 right-0 text-5xl font-serif opacity-20 ${
              isDarkMode ? 'text-[#e5d3b3]' : 'text-[#6F4E37]'
            }`}>03</div>
            <div className={`w-12 h-[1px] mb-6 ${isDarkMode ? 'bg-[#e5d3b3]/30' : 'bg-[#6F4E37]/30'}`} />
            <h3 className="text-xl font-serif mb-4">Layanan Catering</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              Hadirkan sajian Dapoer Thatha untuk memeriahkan berbagai acara spesial Anda di mana saja dengan porsi besar.
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY SECTION */}
      <section id="about" className="flex flex-col md:flex-row w-full min-h-[70vh]">
        <div className="w-full md:w-1/2 min-h-[400px] relative">
          <img 
            src={LANDING_DATA.philosophyImage} 
            alt="Dapoer Thatha Philosophy" 
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>
        <div className={`w-full md:w-1/2 flex flex-col justify-center px-8 py-20 md:px-20 ${
          isDarkMode ? 'bg-[#1e1e1e]' : 'bg-[#FFFDF7]'
        }`}>
          <div className="max-w-lg mx-auto">
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4">
              FILOSOFI KAMI
            </p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
              Cerita Dapoer Thatha Kemiren
            </h2>
            <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-[#e5d3b3]/80' : 'text-[#6F4E37]'}`}>
              Di Dapoer Thatha, kami percaya bahwa bumbu terbaik dalam setiap masakan adalah keikhlasan. Dapur kami didirikan dengan satu keyakinan sederhana — bahwa makanan yang disiapkan dengan dedikasi, bersumber dari alam lokal, dan disajikan dengan senyuman hangat dapat mengubah sebuah hidangan menjadi kenangan.
            </p>
            <p className={`text-sm leading-relaxed mb-10 ${isDarkMode ? 'text-[#e5d3b3]/80' : 'text-[#6F4E37]'}`}>
              Chef kami memadukan tradisi leluhur Nusantara dengan sentuhan rasa modern, menghasilkan hidangan yang akrab di lidah namun selalu memberikan kejutan yang memikat di setiap suapannya.
            </p>
            <button className={`text-xs uppercase tracking-[0.2em] px-8 py-4 transition-colors ${
              isDarkMode 
                ? 'bg-[#e5d3b3] text-[#111] hover:bg-white' 
                : 'bg-[#F5E6CA] text-[#4B3832] hover:bg-[#DCC7AA]'
            }`}>
              BACA KISAH KAMI
            </button>
          </div>
        </div>
      </section>

      {/* SIGNATURE DISHES */}
      <section id="menu" className={`py-32 ${isDarkMode ? 'bg-[#111111]' : 'bg-[#F5E6CA]'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <div className={`w-12 h-[1px] mx-auto mb-6 ${isDarkMode ? 'bg-[#e5d3b3]/30' : 'bg-[#6F4E37]/30'}`} />
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4">DARI DAPUR KAMI</p>
            <h2 className="text-4xl md:text-5xl font-serif">Hidangan Signature</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANDING_DATA.signatureDishes.map((dish) => (
              <div key={dish.id} className="relative group overflow-hidden h-[500px]">
                <img 
                  src={dish.image} 
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  isDarkMode ? 'from-black/90 via-black/20' : 'from-[#4B3832]/90 via-transparent'
                } to-transparent`} />
                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end text-[#FFFDF7]">
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-2 opacity-80">{dish.category}</p>
                  <h3 className="text-2xl font-serif mb-2">{dish.name}</h3>
                  <p className="text-lg">{dish.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/menu" className={`inline-block text-xs uppercase tracking-[0.2em] px-8 py-4 border transition-colors ${
              isDarkMode 
                ? 'border-[#e5d3b3]/50 hover:border-[#e5d3b3]' 
                : 'border-[#4B3832] text-[#4B3832] hover:bg-[#4B3832] hover:text-[#FFFDF7]'
            }`}>
              LIHAT MENU LENGKAP
            </Link>
          </div>
        </div>
      </section>

      {/* STATS & TESTIMONIALS */}
      <section id="testimonials" className={`py-24 border-y ${
        isDarkMode ? 'bg-[#18181b] border-[#e5d3b3]/10' : 'bg-[#FFFDF7] border-[#DCC7AA]'
      }`}>
        {/* Stats */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-serif mb-2">10+</div>
            <div className={`text-[9px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#e5d3b3]/50' : 'text-[#6F4E37]'}`}>TAHUN MELAYANI</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif mb-2">50</div>
            <div className={`text-[9px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#e5d3b3]/50' : 'text-[#6F4E37]'}`}>MENU LOKAL</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif mb-2">200</div>
            <div className={`text-[9px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#e5d3b3]/50' : 'text-[#6F4E37]'}`}>KAPASITAS KURSI</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-serif mb-2">4.9</div>
            <div className={`text-[9px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-[#e5d3b3]/50' : 'text-[#6F4E37]'}`}>RATING PELANGGAN</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className={`w-12 h-[1px] mx-auto mb-6 ${isDarkMode ? 'bg-[#e5d3b3]/30' : 'bg-[#6F4E37]/30'}`} />
            <p className="text-[10px] uppercase tracking-[0.2em] mb-4">PENGALAMAN TAMU</p>
            <h2 className="text-3xl md:text-4xl font-serif">Kesan dari Pelanggan Kami</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANDING_DATA.testimonials.map((testi) => (
              <div key={testi.id} className={`p-10 border text-center flex flex-col justify-center ${
                isDarkMode ? 'border-[#e5d3b3]/10 bg-[#111]' : 'border-[#DCC7AA] bg-[#F5E6CA]/50'
              }`}>
                <div className="text-2xl mb-4 font-serif">&quot;</div>
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testi.stars)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>
                <p className={`text-sm italic mb-8 leading-relaxed ${
                  isDarkMode ? 'text-[#e5d3b3]/80' : 'text-[#6F4E37]'
                }`}>
                  {testi.text}
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] mt-auto">
                  — {testi.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-20 text-xs ${
        isDarkMode ? 'bg-[#111111]' : 'bg-[#F5E6CA]'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-serif mb-6">Dapoer Thatha</h3>
            <p className={`leading-loose mb-6 ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              Sebuah cagar rasa Nusantara di jantung desa adat Kemiren. Menjaga tradisi dalam setiap suapan.
            </p>
          </div>
          
          <div>
            <h4 className="uppercase tracking-[0.2em] mb-6 font-bold">Navigasi</h4>
            <ul className={`space-y-4 ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              <li><a href="#" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'}`}>Beranda</a></li>
              <li><a href="#about" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'}`}>Tentang Kami</a></li>
              <li><a href="#menu" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'}`}>Menu</a></li>
              <li><a href="#testimonials" className={`hover:${isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'}`}>Testimoni</a></li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-[0.2em] mb-6 font-bold">Lokasi Kami</h4>
            <div className="w-full h-32 rounded-lg overflow-hidden border border-[#DCC7AA]/30">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.889397941018!2d114.32986291478143!3d-8.213853194089332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd15ab6b001a1bd%3A0xc3b62f1c84f5068!2sDapoer%20Thatha%20Kemiren!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Dapoer Thatha Kemiren Location"
              />
            </div>
            <p className={`mt-4 text-[10px] ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              Desa Adat Kemiren, Banyuwangi, Jawa Timur
            </p>
          </div>

          <div>
            <h4 className="uppercase tracking-[0.2em] mb-6 font-bold">Jam Buka</h4>
            <ul className={`space-y-4 ${isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'}`}>
              <li>Selasa-Jumat: 10:00 - 22:00</li>
              <li>Sabtu-Minggu: 08:00 - 23:00</li>
              <li>Senin: Tutup</li>
            </ul>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto px-6 mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center ${
          isDarkMode ? 'border-[#e5d3b3]/10 text-[#e5d3b3]/50' : 'border-[#DCC7AA] text-[#6F4E37]'
        }`}>
          <p>© 2024 Dapoer Thatha Kemiren. Seluruh hak cipta dilindungi.</p>
        </div>
      </footer>
      
    </div>
  );
}
