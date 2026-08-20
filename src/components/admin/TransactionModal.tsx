import React, { useEffect } from 'react';

interface TransactionModalProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ transaction, isOpen, onClose }: TransactionModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDF7] w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-[#DCC7AA] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Struk */}
        <div className="p-6 pb-4 border-b border-dashed border-gray-300 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            &times;
          </button>
          <h2 className="text-xl font-black text-[#4B3832] tracking-tight">Detail Transaksi</h2>
          <p className="text-sm font-bold text-[#6F4E37] mt-1">{transaction.invoiceNumber}</p>
          <p className="text-xs font-medium text-gray-500 mt-2">
            {new Date(transaction.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
          </p>
        </div>

        {/* Info Pelanggan */}
        <div className="p-6 py-4 border-b border-dashed border-gray-300 text-sm font-medium">
           <div className="flex justify-between mb-2">
             <span className="text-gray-500">Pelanggan</span>
             <span className="font-bold text-[#4B3832]">{transaction.customerName}</span>
           </div>
           <div className="flex justify-between mb-2">
             <span className="text-gray-500">Tipe Pesanan</span>
             <span className="font-bold uppercase text-[#4B3832]">{transaction.orderType.replace('_', ' ')}</span>
           </div>
           {transaction.tableNumber && (
             <div className="flex justify-between mb-2">
               <span className="text-gray-500">Nomor Meja</span>
               <span className="font-bold text-[#4B3832]">{transaction.tableNumber}</span>
             </div>
           )}
           <div className="flex justify-between">
             <span className="text-gray-500">Kasir</span>
             <span className="font-bold text-[#4B3832]">{transaction.cashierName || '-'}</span>
           </div>
        </div>

        {/* Item List */}
        <div className="p-6 py-4 border-b border-dashed border-gray-300">
           <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Daftar Menu</h3>
           <div className="space-y-3">
             {transaction.items?.map((item: any, idx: number) => (
               <div key={idx} className="flex justify-between items-start text-sm font-bold text-[#4B3832]">
                 <div className="flex-1">
                   <span>{item.quantity}x {item.name}</span>
                 </div>
                 <span className="text-right whitespace-nowrap">
                   Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                 </span>
               </div>
             ))}
           </div>
        </div>

        {/* Totals */}
        <div className="p-6 py-4 bg-[#F5E6CA]/30">
          <div className="space-y-2 text-sm font-medium text-gray-600">
             <div className="flex justify-between">
               <span>Subtotal</span>
               <span>Rp {transaction.subtotal?.toLocaleString('id-ID')}</span>
             </div>
             {transaction.dpAmount > 0 && (
               <div className="flex justify-between text-red-600">
                 <span>Potongan DP</span>
                 <span>- Rp {transaction.dpAmount.toLocaleString('id-ID')}</span>
               </div>
             )}
             {transaction.guideCommission > 0 && (
               <div className="flex justify-between text-red-600">
                 <span>Komisi Tour Guide</span>
                 <span>- Rp {transaction.guideCommission.toLocaleString('id-ID')}</span>
               </div>
             )}
             <div className="flex justify-between pt-2 mt-2 border-t border-[#DCC7AA]/50 font-black text-lg text-[#4B3832]">
               <span>Grand Total</span>
               <span>Rp {transaction.grandTotal?.toLocaleString('id-ID')}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
