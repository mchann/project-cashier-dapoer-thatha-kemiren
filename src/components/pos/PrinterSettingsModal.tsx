// src/components/pos/PrinterSettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BTDevice {
  id: string;
  name: string;
  mac: string;
}

export function PrinterSettingsModal({ isOpen, onClose }: PrinterSettingsModalProps) {
  const [isBtEnabled, setIsBtEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BTDevice[]>([]);
  const [connectingTo, setConnectingTo] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<BTDevice | null>(null);

  // Reset state jika ditutup
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isOpen) {
      timeoutId = setTimeout(() => {
        setIsScanning(false);
        setConnectingTo(null);
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleBt = () => {
    setIsBtEnabled(!isBtEnabled);
    if (isBtEnabled) {
      setDevices([]);
      setConnectedDevice(null);
      setIsScanning(false);
    }
  };

  const handleScan = () => {
    if (!isBtEnabled) return;
    setIsScanning(true);
    setDevices([]);
    
    // Simulasi pencarian bluetooth
    setTimeout(() => {
      setDevices([
        { id: 'dev-1', name: 'POS-58 Thermal Printer', mac: '00:11:22:33:44:55' },
        { id: 'dev-2', name: 'RPP02N Bluetooth', mac: 'AA:BB:CC:DD:EE:FF' },
        { id: 'dev-3', name: 'Smart TV Ruang Tengah', mac: '11:22:33:44:55:66' },
      ]);
      setIsScanning(false);
    }, 2500);
  };

  const handleConnect = (device: BTDevice) => {
    setConnectingTo(device.id);
    // Simulasi menghubungkan
    setTimeout(() => {
      setConnectedDevice(device);
      setConnectingTo(null);
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4B3832]/60 backdrop-blur-sm p-4 md:p-6"
    >
      <div className="bg-[#FFFDF7] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#DCC7AA] flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-[#4B3832] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <svg className="w-5 h-5 text-[#FFFDF7]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            <h2 className="text-base font-black text-[#FFFDF7] tracking-wide">
              Pengaturan Printer Bluetooth
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-transparent hover:bg-[#FFFDF7]/20 text-[#FFFDF7] rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* Toggle Bluetooth Master */}
          <div className="bg-[#F5E6CA]/50 border border-[#DCC7AA] rounded-2xl p-4 flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#4B3832] text-sm">Bluetooth Perangkat</h3>
              <p className="text-xs text-[#6F4E37] mt-0.5">Nyalakan untuk mencari printer</p>
            </div>
            
            <button 
              onClick={handleToggleBt}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isBtEnabled ? 'bg-[#22c55e]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isBtEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {!isBtEnabled ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <h3 className="font-bold text-[#4B3832] text-lg mb-1">Bluetooth Dinonaktifkan</h3>
              <p className="text-sm text-[#6F4E37]">Silakan nyalakan bluetooth perangkat Anda terlebih dahulu untuk memindai printer kasir.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#4B3832] text-sm">Perangkat Tersedia</h3>
                <button
                  onClick={handleScan}
                  disabled={isScanning || connectedDevice !== null}
                  className="text-xs font-bold text-[#6F4E37] hover:text-[#4B3832] disabled:opacity-50 flex items-center gap-1"
                >
                  <svg className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  {isScanning ? 'Memindai...' : 'Pindai Ulang'}
                </button>
              </div>

              {/* Status Pindai & Daftar Perangkat */}
              <div className="space-y-3">
                {connectedDevice && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-600 mb-0.5">TERHUBUNG</p>
                        <h4 className="text-sm font-black text-[#4B3832] leading-tight">{connectedDevice.name}</h4>
                        <p className="text-[10px] font-medium text-[#6F4E37]">{connectedDevice.mac}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      Putus
                    </button>
                  </div>
                )}

                {isScanning && devices.length === 0 && (
                  <div className="py-10 text-center flex flex-col items-center">
                    <svg className="animate-spin w-8 h-8 text-[#DCC7AA] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-sm font-bold text-[#6F4E37]">Sedang mencari perangkat Bluetooth di sekitar...</p>
                  </div>
                )}

                {!isScanning && devices.length === 0 && !connectedDevice && (
                  <div className="py-10 text-center">
                    <p className="text-sm font-bold text-[#8B7355]">Tidak ada perangkat terdeteksi.</p>
                    <p className="text-xs text-[#6F4E37] mt-1">Pastikan printer kasir sudah menyala dan dalam mode pairing.</p>
                  </div>
                )}

                {devices.map((device) => {
                  if (connectedDevice?.id === device.id) return null; // Sembunyikan jika sedang terhubung

                  const isConnecting = connectingTo === device.id;

                  return (
                    <div key={device.id} className="bg-white border border-[#DCC7AA]/60 rounded-xl p-3.5 flex items-center justify-between hover:border-[#4B3832]/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F5E6CA]/50 rounded-full flex items-center justify-center text-[#6F4E37] shrink-0">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#4B3832] leading-tight">{device.name}</h4>
                          <p className="text-[10px] font-medium text-[#8B7355]">{device.mac}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleConnect(device)}
                        disabled={isConnecting || connectedDevice !== null}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors w-24 flex justify-center ${
                          isConnecting ? 'bg-[#DCC7AA] text-white cursor-wait' : 'bg-[#4B3832] hover:bg-[#6F4E37] text-white'
                        }`}
                      >
                        {isConnecting ? (
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : 'Hubungkan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
