// src/components/pos/ReceiptModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Order } from '@/types/pos';

interface ReceiptModalProps {
  isOpen: boolean;
  transactionData: Order | null;
  onClose: () => void;
}

export function ReceiptModal({ isOpen, transactionData, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => setSettings(data.receipt))
        .catch(err => console.error('Gagal memuat pengaturan', err));
    }
  }, [isOpen]);


  // Focus lock or any other modal side-effects
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transactionData) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm print:bg-white print:backdrop-blur-none p-4"
      onClick={onClose}
    >
      {/* Container ini hanya tampil di layar screen, dibuang saat print kecuali child #printable-receipt */}
      <div 
        className="bg-[#FFFDF7] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-w-full print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Modal (Disembunyikan saat print) */}
        <div className="px-6 py-4 border-b border-[#DCC7AA] flex justify-between items-center print:hidden bg-[#4B3832] text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Struk Kasir
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#6F4E37] rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Konten Struk (Area Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f1f5f9] print:bg-white print:p-0 print:overflow-visible custom-scrollbar">
          
          {/* Ini adalah elemen yang akan diprint */}
          <div 
            id="printable-receipt" 
            ref={receiptRef}
            className="bg-white mx-auto text-black p-4 shadow-sm font-mono text-[12px] leading-[1.4] print:shadow-none print:p-0 w-full"
            style={{ maxWidth: '80mm', color: '#000' }}
          >
            {/* Kop Struk */}
            <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
              <h1 className="font-black text-xl tracking-tight mb-1">{settings?.storeName || 'DAPOER THATHA'}</h1>
              <p className="text-[10px]">{settings?.address || 'Desa Kemiren, Glagah, Banyuwangi'}</p>
              <p className="text-[10px]">Telp: {settings?.phone || '0812-3456-7890'}</p>

              {/* Nomor Meja Besar untuk Makan di Tempat */}
              {transactionData.orderType === 'dine_in' && transactionData.tableNumber && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-400">
                  <p className="text-[10px] uppercase font-bold tracking-widest">Nomor Meja</p>
                  <h2 className="text-4xl font-black mt-1">{transactionData.tableNumber}</h2>
                </div>
              )}
            </div>

            {/* Info Transaksi */}
            <div className="mb-4">
              <div className="flex justify-between">
                <span>Waktu</span>
                <span>{new Date(transactionData.createdAt || Date.now()).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>No. INV</span>
                <span>{transactionData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir</span>
                <span>{transactionData.cashierName || 'Kasir 1'}</span>
              </div>
              <div className="flex justify-between">
                <span>Meja/Tipe</span>
                <span>{transactionData.tableNumber || transactionData.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span>Tamu</span>
                <span>{transactionData.customerName}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Rincian Item */}
            <div className="mb-4 space-y-2">
              {transactionData.items.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-bold">{item.name}</span>
                  <div className="flex justify-between">
                    <span>{item.quantity} x {formatRupiah(item.price)}</span>
                    <span>{formatRupiah(item.quantity * item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Totalan */}
            <div className="space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(transactionData.subtotal)}</span>
              </div>
              {transactionData.dpAmount > 0 && (
                <div className="flex justify-between">
                  <span>DP / Uang Muka</span>
                  <span>- {formatRupiah(transactionData.dpAmount)}</span>
                </div>
              )}
              {transactionData.guideCommission > 0 && (
                <div className="flex justify-between">
                  <span>Fee Guide</span>
                  <span>- {formatRupiah(transactionData.guideCommission)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-[14px] mt-2 border-t border-gray-300 pt-2">
                <span>TOTAL</span>
                <span>{formatRupiah(transactionData.grandTotal)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Tunai</span>
                <span>{formatRupiah(transactionData.amountReceived || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali</span>
                <span>{formatRupiah(transactionData.changeAmount || 0)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2"></div>

            {/* Footer */}
            <div className="text-center mt-4">
              {(settings?.footerMessage || 'TERIMA KASIH\nAtas kunjungan Anda').split('\n').map((line: string, i: number) => (
                <p key={i} className={i === 0 ? "font-bold text-[11px]" : "text-[10px] mt-1"}>{line}</p>
              ))}
              <p className="text-[9px] mt-2 italic text-gray-600">{settings?.wifiInfo || 'Wifi: dapoerthatha | Pass: kemiren123'}</p>
            </div>
          </div>
        </div>

        {/* Footer Action (Disembunyikan saat print) */}
        <div className="p-4 bg-[#FFFDF7] border-t border-[#DCC7AA] flex gap-3 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-[#6F4E37] font-bold border border-[#DCC7AA] rounded-xl hover:bg-[#F5E6CA] transition-colors"
          >
            Selesai & Tutup
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 py-3 bg-[#4B3832] text-[#FFFDF7] font-bold rounded-xl shadow-md hover:bg-[#6F4E37] hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
