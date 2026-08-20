// src/components/pos/VoidPinModal.tsx
'use client';

import React, { useState } from 'react';

interface VoidPinModalProps {
  isOpen: boolean;
  tableNumber: string;
  onClose: () => void;
  onConfirmVoid: (pin: string, reason: string) => void;
}

export function VoidPinModal({
  isOpen,
  tableNumber,
  onClose,
  onConfirmVoid,
}: VoidPinModalProps) {
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length < 4) {
      setErrorMsg('PIN otorisasi harus minimal 4 angka.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Alasan pembatalan wajib diisi.');
      return;
    }
    setErrorMsg('');
    onConfirmVoid(pin, reason);
    setPin('');
    setReason('');
  };

  const handleClose = () => {
    setErrorMsg('');
    setPin('');
    setReason('');
    onClose();
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm p-4 md:p-6"
    >
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#DCC7AA]/50 flex flex-col">
        {/* Header Modal */}
        <div className="bg-red-50 px-5 py-4 flex items-center justify-between border-b border-red-100 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             </div>
            <h2 id="void-modal-title" className="text-sm font-black text-red-700 tracking-wide">
              Otorisasi Batal (Meja {tableNumber || '-'})
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-red-200 text-red-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form PIN & Alasan */}
        <div className="p-6">
          <p className="text-xs text-[#6F4E37] font-medium mb-6 text-center">
            Pembatalan menu memerlukan otorisasi <strong className="text-red-600">PIN Owner</strong>. Stok akan otomatis dikembalikan (+1).
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="void-pin-input" 
                className="block text-xs font-bold text-[#4B3832] mb-1.5"
              >
                PIN Otorisasi
              </label>
              <input
                id="void-pin-input"
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••"
                autoFocus
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 font-mono font-black text-2xl text-[#4B3832] text-center tracking-widest focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            <div>
              <label 
                htmlFor="void-reason-input" 
                className="block text-xs font-bold text-[#4B3832] mb-1.5"
              >
                Alasan Pembatalan
              </label>
              <input
                id="void-reason-input"
                type="text"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Contoh: Tamu salah pesan..."
                className="w-full bg-transparent border border-[#DCC7AA] rounded-xl px-4 py-3 font-bold text-sm text-[#4B3832] focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
              />
            </div>

            {/* Pesan Error */}
            {errorMsg && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-xs font-bold leading-tight">{errorMsg}</p>
              </div>
            )}

            {/* Tombol Aksi */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-transparent border border-[#DCC7AA] hover:bg-[#F5E6CA] text-[#6F4E37] font-bold text-xs uppercase tracking-wider rounded-full transition-colors"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                Konfirmasi
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
