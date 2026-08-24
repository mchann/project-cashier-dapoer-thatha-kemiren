// src/components/pos/PrinterSettingsModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PrinterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrinterSettingsModal({ isOpen, onClose }: PrinterSettingsModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Menggunakan 'any' untuk menghindari error typescript bawaan jika @types/web-bluetooth tidak ada
  const characteristicRef = useRef<any>(null);
  const deviceRef = useRef<any>(null);

  // Reset state jika ditutup
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (!isOpen) {
      timeoutId = setTimeout(() => {
        setIsScanning(false);
        setErrorMessage(null);
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanAndConnect = async () => {
    try {
      setErrorMessage(null);
      setIsScanning(true);

      // Cek dukungan Web Bluetooth
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth tidak didukung di browser ini. Harap gunakan Chrome atau Edge.');
      }

      // Minta izin perangkat dengan opsi acceptAllDevices
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard BLE Printer
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', 
          '0000fee7-0000-1000-8000-00805f9b34fb'
        ]
      });

      if (!device.gatt) throw new Error('Perangkat GATT tidak tersedia');
      
      const server = await device.gatt.connect();
      
      const serviceUuids = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '0000fee7-0000-1000-8000-00805f9b34fb'
      ];

      let primaryService = null;
      for (const uuid of serviceUuids) {
        try {
          primaryService = await server.getPrimaryService(uuid);
          if (primaryService) break;
        } catch (e) {
          // Lanjut coba UUID berikutnya
        }
      }

      if (!primaryService) {
        // Fallback ambil service pertama
        const services = await server.getPrimaryServices();
        if (services.length > 0) {
          primaryService = services[0];
        } else {
          throw new Error('Tidak ada Bluetooth Service yang didukung.');
        }
      }

      const characteristics = await primaryService.getCharacteristics();
      const writeCharacteristic = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

      if (!writeCharacteristic) {
        throw new Error('Tidak memiliki akses tulis (Write) pada perangkat ini.');
      }

      characteristicRef.current = writeCharacteristic;
      deviceRef.current = device;
      setConnectedDeviceName(device.name || 'Printer Bluetooth');

      device.addEventListener('gattserverdisconnected', handleDisconnectEvent);

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Gagal menghubungkan ke printer');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDisconnectEvent = () => {
    setConnectedDeviceName(null);
    characteristicRef.current = null;
    deviceRef.current = null;
  };

  const handleDisconnect = () => {
    if (deviceRef.current && deviceRef.current.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    handleDisconnectEvent();
  };

  const handleTestPrint = async () => {
    if (!characteristicRef.current) return;
    try {
      const encoder = new TextEncoder();
      const initCmd = new Uint8Array([0x1B, 0x40]); // ESC @
      const textData = encoder.encode('--- DAPOER THATHA ---\nTest Print Berhasil!\nKoneksi Bluetooth Lancar.\n\n\n');
      
      const printData = new Uint8Array(initCmd.length + textData.length);
      printData.set(initCmd);
      printData.set(textData, initCmd.length);
      
      await characteristicRef.current.writeValue(printData);
      setErrorMessage(null);
    } catch (error: any) {
      console.error(error);
      setErrorMessage('Gagal mencetak: ' + (error.message || 'Unknown error'));
    }
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
              Pengaturan Printer Web Bluetooth
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
          
          {/* Info Singkat */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-800">
              Browser akan meminta Anda memilih perangkat Bluetooth. Pastikan Printer Thermal Anda menyala dan siap (pairing mode).
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-bold text-red-700">{errorMessage}</p>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            
            {!connectedDeviceName ? (
              <div className="text-center w-full">
                <button
                  onClick={handleScanAndConnect}
                  disabled={isScanning}
                  className={`w-full max-w-xs mx-auto py-3 px-6 rounded-xl font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                    isScanning ? 'bg-[#DCC7AA] cursor-wait' : 'bg-[#4B3832] hover:bg-[#6F4E37] shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Menyambungkan...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                      Cari & Hubungkan Printer
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  </div>
                  <h3 className="text-xs font-black text-emerald-600 tracking-widest uppercase mb-1">TERHUBUNG</h3>
                  <h4 className="text-lg font-black text-[#4B3832]">{connectedDeviceName}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={handleTestPrint}
                    className="py-3 px-4 bg-[#8B7355] text-white rounded-xl font-bold hover:bg-[#6F4E37] transition-colors active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Test Print
                  </button>
                  <button 
                    onClick={handleDisconnect}
                    className="py-3 px-4 bg-white border-2 border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors active:scale-95"
                  >
                    Putus Koneksi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
