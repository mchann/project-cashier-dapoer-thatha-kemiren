'use client';

import React, { useState, useEffect } from 'react';

export interface StaffData {
  _id?: string;
  name: string;
  username: string;
  isActive: boolean;
  role?: string;
  password?: string;
  createdAt?: string;
}

interface StaffModalProps {
  isOpen: boolean;
  initialData?: StaffData | null;
  onClose: () => void;
  onSave: (data: StaffData) => void;
}

export function StaffModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: StaffModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
      <StaffForm
        key={initialData?._id || 'new-staff'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
      />
      </div>
    </div>
  );
}

function StaffForm({ initialData, onClose, onSave }: Omit<StaffModalProps, 'isOpen'>) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
        if (!username.trim()) {
      setErrorMsg('Username tidak boleh kosong.');
      return;
    }
    
    // Jika menambah staff baru, password wajib diisi
    if (!initialData && !password.trim()) {
      setErrorMsg('Password wajib diisi untuk staff baru.');
      return;
    }

    onSave({
      _id: initialData?._id,
      name: username.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password: password.trim() !== '' ? password : undefined,
      isActive,
    });
  };

  return (
    <div className="bg-[#FFFDF7] rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header Modal */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
        <h2 id="staff-modal-title" className="text-2xl font-bold text-[#4B3832]">
          {initialData ? 'Edit Profil Staff' : 'Tambah Staff Baru'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#4B3832] text-[#FFFDF7] flex items-center justify-center hover:bg-[#6F4E37] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Form Container */}
      <div className="px-8 pb-8 overflow-y-auto flex-1 custom-scrollbar">
        <form id="staff-form" onSubmit={handleSubmit} className="border border-[#DCC7AA]/70 rounded-[2rem] p-8 space-y-6">
          
          <div className="grid grid-cols-1 gap-y-6">
            <div>
              <label htmlFor="staff-username" className="block text-sm font-medium text-[#6F4E37] mb-2">
                Username (Untuk Login)
              </label>
              <input
                id="staff-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/\\s+/g, '').toLowerCase());
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="contoh: siti"
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className="block text-sm font-medium text-[#6F4E37] mb-2">
                {initialData ? 'Kata Sandi Baru (Kosongkan jika tidak ingin diubah)' : 'Kata Sandi Awal'}
              </label>
              <div className="relative">
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={initialData ? 'Ketik password baru...' : 'Buat sandi yang aman'}
                  className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 pr-12 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#DCC7AA] hover:text-[#6F4E37] transition-colors"
                  title={showPassword ? 'Sembunyikan Sandi' : 'Lihat Sandi'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                id="staff-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-[#DCC7AA] text-[#4B3832] focus:ring-[#6F4E37] cursor-pointer"
              />
              <label htmlFor="staff-active" className="text-sm font-semibold text-[#4B3832] cursor-pointer select-none">
                Akun Aktif (Bisa Login)
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl">
              {errorMsg}
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-full border border-[#DCC7AA] bg-[#FFFDF7] hover:bg-[#F5E6CA] text-[#4B3832] text-sm font-bold transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="staff-form"
            className="px-8 py-3 rounded-full bg-[#4B3832] hover:bg-[#6F4E37] text-[#FFFDF7] text-sm font-bold transition-colors shadow-sm"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
