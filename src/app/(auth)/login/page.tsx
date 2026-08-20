// src/app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginImage, setLoginImage] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.landingPage?.loginImage) {
          setLoginImage(data.landingPage.loginImage);
        } else {
          setLoginImage('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop');
        }
      })
      .catch(err => {
        console.error(err);
        setLoginImage('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop');
      })
      .finally(() => {
        setIsImageLoading(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        // Redirect ke admin atau pos berdasarkan role? 
        // Sementara kita arahkan ke dashboard admin.
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className={`min-h-screen flex w-full transition-colors duration-500 ${
      isDarkMode ? 'bg-[#111111]' : 'bg-[#FFFDF7]'
    }`}>
      {/* LEFT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        {/* TOP BAR: Back Link & Theme Toggle */}
        <div className="absolute top-8 left-8 right-8 sm:left-16 sm:right-16 md:left-24 md:right-24 xl:left-32 xl:right-32 flex justify-between items-center">
          <Link 
            href="/" 
            className={`text-sm font-semibold transition-colors flex items-center gap-2 ${
              isDarkMode ? 'text-[#e5d3b3]/70 hover:text-[#e5d3b3]' : 'text-[#6F4E37]/70 hover:text-[#4B3832]'
            }`}
          >
            <span>&larr;</span> Kembali
          </Link>
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
        </div>

        <div className="w-full max-w-md mx-auto mt-16">
          <div className="mb-10 text-center">
            <h1 className={`text-3xl font-bold mb-3 ${
              isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'
            }`}>Selamat Datang!</h1>
            <p className={`text-sm ${
              isDarkMode ? 'text-[#e5d3b3]/70' : 'text-[#6F4E37]'
            }`}>Silakan masukkan detail Anda untuk login.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-[#e5d3b3]/90' : 'text-[#4B3832]'
              }`}>
                Username
              </label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors outline-none text-sm ${
                  isDarkMode 
                    ? 'bg-[#18181b] border-[#e5d3b3]/20 focus:border-[#e5d3b3] text-[#e5d3b3] placeholder-[#e5d3b3]/30' 
                    : 'bg-white border-[#DCC7AA] focus:border-[#4B3832] text-[#4B3832] placeholder-[#6F4E37]/40'
                }`}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-sm font-semibold ${
                  isDarkMode ? 'text-[#e5d3b3]/90' : 'text-[#4B3832]'
                }`}>
                  Kata Sandi
                </label>
              </div>
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors outline-none text-sm ${
                  isDarkMode 
                    ? 'bg-[#18181b] border-[#e5d3b3]/20 focus:border-[#e5d3b3] text-[#e5d3b3] placeholder-[#e5d3b3]/30' 
                    : 'bg-white border-[#DCC7AA] focus:border-[#4B3832] text-[#4B3832] placeholder-[#6F4E37]/40'
                }`}
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-sm tracking-wide mt-4 disabled:opacity-50 flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-[#e5d3b3] hover:bg-white text-[#111111]' 
                  : 'bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7]'
              }`}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          
          <div className={`mt-8 text-center text-xs ${
            isDarkMode ? 'text-[#e5d3b3]/40' : 'text-[#6F4E37]/60'
          }`}>
            Hanya untuk penggunaan internal Staff & Admin.
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Image Cover */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className={`absolute inset-4 rounded-3xl overflow-hidden border ${
          isDarkMode ? 'border-[#e5d3b3]/10' : 'border-[#DCC7AA]'
        }`}>
          {isImageLoading ? (
            <div className={`w-full h-full flex flex-col items-center justify-center animate-pulse ${isDarkMode ? 'bg-[#222222]' : 'bg-[#e5d3b3]/30'}`}>
              <div className={`w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-[#333333]' : 'bg-[#e5d3b3]/50'}`}></div>
              <div className={`h-4 w-1/3 rounded mb-2 ${isDarkMode ? 'bg-[#333333]' : 'bg-[#e5d3b3]/50'}`}></div>
              <div className={`h-3 w-1/4 rounded ${isDarkMode ? 'bg-[#333333]' : 'bg-[#e5d3b3]/50'}`}></div>
            </div>
          ) : (
            <>
              <img
                src={loginImage}
                alt="Restaurant Interior"
                className="w-full h-full object-cover"
              />
              
              {/* Glassmorphism Quote Overlay */}
              <div className={`absolute bottom-12 left-12 right-12 backdrop-blur-md p-8 rounded-2xl shadow-2xl ${
                isDarkMode 
                  ? 'bg-black/40 border border-white/10' 
                  : 'bg-[#F5E6CA]/60 border border-[#DCC7AA]/50'
              }`}>
                <p className={`text-lg leading-relaxed font-medium mb-6 ${
                  isDarkMode ? 'text-[#e5d3b3]' : 'text-[#4B3832]'
                }`}>
                  &quot;Kenyamanan pelanggan berawal dari manajemen yang tertata rapi. Mari ciptakan harmoni dari dapur hingga ke meja.&quot;
                </p>
                <div>
                  <p className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-[#4B3832]'}`}>
                    Sistem Manajemen
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#e5d3b3]/80' : 'text-[#6F4E37]'}`}>
                    Dapoer Thatha Kemiren
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
