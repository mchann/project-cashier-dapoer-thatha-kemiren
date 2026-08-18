'use client';

import React, { useState } from 'react';

export interface StaffData {
  _id?: string;
  name: string;
  username: string;
  isActive: boolean;
  role?: string;
  password?: string;
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
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <StaffForm
        key={initialData?._id || 'new-staff'}
        initialData={initialData}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}

function StaffForm({ initialData, onClose, onSave }: Omit<StaffModalProps, 'isOpen'>) {
    const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState('');
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
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={initialData ? 'Ketik password baru...' : 'Buat sandi yang aman'}
                className="w-full bg-transparent border border-[#DCC7AA] rounded-2xl px-4 py-3 text-sm font-semibold text-[#4B3832] focus:border-[#6F4E37] focus:ring-1 focus:ring-[#6F4E37] outline-none transition-all placeholder:text-[#DCC7AA]"
              />
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
