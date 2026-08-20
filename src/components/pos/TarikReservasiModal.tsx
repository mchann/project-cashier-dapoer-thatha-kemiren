import React, { useState } from 'react';

interface TarikReservasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadReservation: (draftData: any) => void;
}

export function TarikReservasiModal({ isOpen, onClose, onLoadReservation }: TarikReservasiModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTarik = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/draft-orders/${code.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menarik data reservasi');
      }

      // Berhasil narik
      onLoadReservation(data);
      setCode('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF7] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-[#DCC7AA]">
        <div className="bg-[#4B3832] p-5 text-center">
          <h2 className="text-xl font-black text-[#FFFDF7] uppercase tracking-widest">Tarik Reservasi</h2>
          <p className="text-[#DCC7AA] text-xs font-medium mt-1">Masukkan kode 4 digit dari pelanggan</p>
        </div>
        
        <form onSubmit={handleTarik} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#6F4E37] uppercase tracking-wider mb-2 text-center">
              Kode Reservasi
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Misal: 1234"
              maxLength={4}
              className="w-full bg-white border-2 border-[#DCC7AA] focus:border-[#4B3832] rounded-xl px-4 py-4 text-center font-black text-3xl tracking-widest text-[#4B3832] outline-none transition-all placeholder:font-normal placeholder:text-gray-300"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setCode('');
                setError('');
              }}
              className="py-3 rounded-xl font-bold text-[#4B3832] border border-[#DCC7AA] hover:bg-[#F5E6CA] transition-colors uppercase text-sm tracking-wider"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !code.trim() || code.length < 4}
              className="py-3 rounded-xl font-black text-[#FFFDF7] bg-[#4B3832] hover:bg-[#6F4E37] transition-colors uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cek...' : 'Tarik Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
