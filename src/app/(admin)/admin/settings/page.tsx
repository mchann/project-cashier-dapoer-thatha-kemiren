// src/app/(admin)/admin/settings/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'receipt' | 'landing' | 'reservation' | 'pos'>('receipt');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Form State
  const [receipt, setReceipt] = useState({
    storeName: '',
    address: '',
    phone: '',
    footerMessage: '',
    wifiInfo: ''
  });

  const [reservation, setReservation] = useState({
    whatsappNumber: ''
  });

  const [landingPage, setLandingPage] = useState({
    heroImage: '',
    aboutImage: '',
    aboutText: ''
  });

  const [pos, setPos] = useState({
    cancellationPin: '1234'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setReceipt(data.receipt || receipt);
        setLandingPage(data.landingPage || landingPage);
        setReservation(data.reservation || reservation);
        setPos(data.pos || pos);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(''), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt, landingPage, reservation, pos })
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      showNotification('Pengaturan berhasil disimpan!');
    } catch (error: any) {
      showNotification(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File, field: 'heroImage' | 'aboutImage') => {
    try {
      setIsSaving(true); // disable buttons while uploading
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: reader.result })
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setLandingPage(prev => ({ ...prev, [field]: data.url }));
          } else {
            alert('Upload gagal');
          }
        } catch (err) {
          console.error(err);
          alert('Upload gagal');
        } finally {
          setIsSaving(false);
        }
      };
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[#8B7355]">Memuat Pengaturan...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#4B3832] tracking-tight">Pengaturan Sistem</h1>
          <p className="text-[#8B7355] mt-1">Kelola informasi toko, struk kasir, dan konten website utama.</p>
        </div>
      </div>

      {notif && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 font-bold">
          {notif}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#DCC7AA]">
        <button
          onClick={() => setActiveTab('receipt')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'receipt' 
              ? 'border-[#8B7355] text-[#4B3832]' 
              : 'border-transparent text-[#8B7355] hover:text-[#4B3832] hover:bg-[#F5E6CA]/50'
          }`}
        >
          Pengaturan Struk
        </button>
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'landing' 
              ? 'border-[#8B7355] text-[#4B3832]' 
              : 'border-transparent text-[#8B7355] hover:text-[#4B3832] hover:bg-[#F5E6CA]/50'
          }`}
        >
          Pengaturan Landing Page
        </button>
        <button
          onClick={() => setActiveTab('reservation')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'reservation' 
              ? 'border-[#8B7355] text-[#4B3832]' 
              : 'border-transparent text-[#8B7355] hover:text-[#4B3832] hover:bg-[#F5E6CA]/50'
          }`}
        >
          Pengaturan Reservasi
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'pos' 
              ? 'border-[#8B7355] text-[#4B3832]' 
              : 'border-transparent text-[#8B7355] hover:text-[#4B3832] hover:bg-[#F5E6CA]/50'
          }`}
        >
          Keamanan POS
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-[#DCC7AA] p-6">
        
        {/* TAB STRUK */}
        {activeTab === 'receipt' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#4B3832] border-b border-[#DCC7AA]/50 pb-2">Informasi Kop Struk</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-2">Nama Toko</label>
                <input 
                  type="text" 
                  value={receipt.storeName}
                  onChange={e => setReceipt({...receipt, storeName: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none"
                  placeholder="Contoh: DAPOER THATHA"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-2">No. HP / WhatsApp</label>
                <input 
                  type="text" 
                  value={receipt.phone}
                  onChange={e => setReceipt({...receipt, phone: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none"
                  placeholder="Contoh: 0812-3456-7890"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#8B7355] mb-2">Alamat Toko</label>
                <textarea 
                  value={receipt.address}
                  onChange={e => setReceipt({...receipt, address: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none"
                  rows={2}
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#4B3832] border-b border-[#DCC7AA]/50 pb-2 mt-8">Informasi Footer Struk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-2">Pesan Penutup (Terima Kasih)</label>
                <textarea 
                  value={receipt.footerMessage}
                  onChange={e => setReceipt({...receipt, footerMessage: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none"
                  rows={3}
                  placeholder="Contoh: TERIMA KASIH\nAtas Kunjungan Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-2">Info WiFi / Pesan Khusus</label>
                <textarea 
                  value={receipt.wifiInfo}
                  onChange={e => setReceipt({...receipt, wifiInfo: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none"
                  rows={3}
                  placeholder="Contoh: Wifi: dapoerthatha | Pass: kemiren123"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB LANDING PAGE */}
        
        {/* TAB RESERVASI */}
        {activeTab === 'reservation' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-[#FFFDF7] p-8 rounded-3xl shadow-sm border border-[#DCC7AA]/70">
              <h2 className="text-xl font-bold text-[#4B3832] mb-6">Informasi Kontak Reservasi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#8B7355] mb-2">Nomor WhatsApp Penerima Reservasi</label>
                  <input
                    type="text"
                    value={reservation.whatsappNumber}
                    onChange={(e) => setReservation({ ...reservation, whatsappNumber: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-white border border-[#DCC7AA] rounded-2xl px-4 py-3 font-bold text-[#4B3832] focus:border-[#4B3832] outline-none transition-all"
                  />
                  <p className="text-xs text-[#8B7355] mt-2">Nomor WhatsApp ini akan digunakan untuk menerima pesan format reservasi dari pelanggan melalui website.</p>
                </div>
              </div>
            </div>
          </div>
        )}
  

        {activeTab === 'landing' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#4B3832] border-b border-[#DCC7AA]/50 pb-2 mb-4">Banner Utama (Hero Section)</h2>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-[#8B7355] mb-2">Upload Foto Banner</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'heroImage')}
                    className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-2">Gunakan foto landscape yang berkualitas tinggi (rasio 16:9 disarankan).</p>
                </div>
                {landingPage.heroImage && (
                  <div className="w-full md:w-1/3 rounded-xl overflow-hidden border border-[#DCC7AA] shadow-sm">
                    <img src={landingPage.heroImage} alt="Hero Banner Preview" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#4B3832] border-b border-[#DCC7AA]/50 pb-2 mb-4">Bagian Tentang Kami (Filosofi)</h2>
              <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-[#8B7355] mb-2">Upload Foto Ilustrasi</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'aboutImage')}
                    className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] bg-gray-50"
                  />
                </div>
                {landingPage.aboutImage && (
                  <div className="w-full md:w-1/3 rounded-xl overflow-hidden border border-[#DCC7AA] shadow-sm">
                    <img src={landingPage.aboutImage} alt="About Preview" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-2">Teks Deskripsi Filosofi</label>
                <textarea 
                  value={landingPage.aboutText}
                  onChange={e => setLandingPage({...landingPage, aboutText: e.target.value})}
                  className="w-full p-3 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none leading-relaxed"
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB POS */}
        {activeTab === 'pos' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#4B3832] border-b border-[#DCC7AA]/50 pb-2">Pengaturan Keamanan Kasir (POS)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#8B7355] mb-2">PIN Otorisasi (Batal/Void)</label>
                <div className="relative">
                  <input 
                    type={showPin ? "text" : "password"} 
                    value={pos.cancellationPin}
                    onChange={e => setPos({...pos, cancellationPin: e.target.value})}
                    className="w-full p-3 pr-12 rounded-xl border border-[#DCC7AA] focus:ring-2 focus:ring-[#8B7355] focus:border-[#8B7355] outline-none"
                    placeholder="Contoh: 1234"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-[14px] text-[#8B7355] hover:text-[#4B3832]"
                  >
                    {showPin ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                  <p className="text-xs text-[#8B7355] mt-2">PIN ini akan diminta saat kasir menekan tombol "Void / Batal Transaksi" untuk menghapus seluruh tagihan yang sudah tersimpan. Masukkan 4-6 digit angka (Default: 1234).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 pt-6 border-t border-[#DCC7AA] flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="px-8 py-3 bg-[#4B3832] hover:bg-[#6F4E37] text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>

      </form>
    </div>
  );
}
