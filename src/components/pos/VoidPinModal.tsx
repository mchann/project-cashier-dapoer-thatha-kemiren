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
      setErrorMsg('PIN Void harus minimal 4-6 angka otorisasi Owner.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Alasan pembatalan (void) wajib diisi.');
      return;
    }
    setErrorMsg('');
    onConfirmVoid(pin, reason);
    setPin('');
    setReason('');
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="void-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4"
    >
      <div className="bg-white rounded-2xl border-4 border-red-700 shadow-2xl w-full max-w-lg p-6 space-y-5">
        {/* Header Modal */}
        <div className="border-b-2 border-slate-300 pb-3">
          <span className="bg-red-700 text-white font-extrabold text-xs px-2.5 py-1 rounded uppercase tracking-wider">
            OTORISASI KEAMANAN OWNER
          </span>
          <h2 id="void-modal-title" className="text-2xl font-black text-red-700 mt-2">
            VOID / BATAL PESANAN (MEJA {tableNumber || '-'})
          </h2>
          <p className="text-sm text-[#57300a] mt-1 font-bold">
            Pembatalan menu wajib meminta otorisasi PIN Void Superadmin (Owner). Stok akan otomatis dikembalikan (+1).
          </p>
        </div>

        {/* Form PIN & Alasan */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="void-pin-input" 
              className="block text-base font-black text-[#291404] mb-1"
            >
              PIN VOID OWNER (Superadmin):
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
              className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-3 font-mono font-black text-2xl text-[#291404] text-center tracking-widest focus:border-red-600"
            />
          </div>

          <div>
            <label 
              htmlFor="void-reason-input" 
              className="block text-base font-black text-[#291404] mb-1"
            >
              Alasan Pembatalan / Komplain:
            </label>
            <input
              id="void-reason-input"
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Pelanggan salah pesan / batal makan"
              className="w-full bg-[#fefce8] border-2 border-[#a8a29e] rounded-xl px-4 py-3 font-bold text-base text-[#291404] focus:border-red-600"
            />
          </div>

          {errorMsg && (
            <div 
              role="alert" 
              className="bg-red-100 border-2 border-red-500 text-red-900 font-bold px-4 py-2.5 rounded-lg text-sm"
            >
              {errorMsg}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#fefce8] hover:bg-[#fef3c7] text-[#291404] font-bold py-3 rounded-xl border-2 border-[#d6d3d1] cursor-pointer transition-colors"
            >
              Batal & Kembali
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-700 hover:bg-red-800 text-white font-black py-3 rounded-xl border-2 border-red-500 shadow-md cursor-pointer transition-colors"
            >
              KONFIRMASI VOID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
