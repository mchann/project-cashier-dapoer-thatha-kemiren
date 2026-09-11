import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/types/pos';
import { PendingOrder } from './PendingOrders';
import { ProductSelectionModal } from './ProductSelectionModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
  selectedOrder: PendingOrder | null;
  products: Product[];
  categories: Category[];
  isSubmitting: boolean;
  error: string;
  formatRupiah: (amount: number) => string;
}

export function RewardModal({
  isOpen,
  onClose,
  onSubmit,
  selectedOrder,
  products,
  categories,
  isSubmitting,
  error,
  formatRupiah
}: Props) {
  const [cashbackAmount, setCashbackAmount] = useState<number | ''>('');
  const [discountPercentage, setDiscountPercentage] = useState<number | ''>('');
  const [freeProducts, setFreeProducts] = useState<Array<{productId: string; quantity: number}>>([]);
  const [manualGuideName, setManualGuideName] = useState('');
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCashbackAmount('');
      setDiscountPercentage('');
      setFreeProducts([]);
      setManualGuideName(selectedOrder ? selectedOrder.guideName : '');
    }
  }, [isOpen, selectedOrder]);

  if (!isOpen) return null;

  const handleAddFreeProduct = () => {
    setIsProductSelectorOpen(true);
  };

  const handleSelectProduct = (productId: string, quantity: number) => {
    // Cek apakah produk sudah ada
    const existingIndex = freeProducts.findIndex(fp => fp.productId === productId);
    if (existingIndex >= 0) {
      const updated = [...freeProducts];
      updated[existingIndex].quantity += quantity;
      setFreeProducts(updated);
    } else {
      setFreeProducts([...freeProducts, { productId, quantity }]);
    }
  };

  const handleRemoveFreeProduct = (index: number) => {
    setFreeProducts(freeProducts.filter((_, i) => i !== index));
  };

  const handleUpdateFreeProduct = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...freeProducts];
    updated[index] = { ...updated[index], [field]: value };
    setFreeProducts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      guideName: manualGuideName || 'Guide',
      sourceTransactionId: selectedOrder?._id || undefined,
      rewards: {
        cashbackAmount: Number(cashbackAmount) || 0,
        discountPercentage: Number(discountPercentage) || 0,
        freeProducts: freeProducts.filter(fp => fp.quantity > 0)
      }
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#4B3832]/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-[#FFFDF7] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#4B3832] px-6 py-5 flex justify-between items-center shrink-0">
          <h3 className="text-[#FFFDF7] font-black text-lg tracking-wide">
            {selectedOrder ? 'Proses Reward Guide' : 'Buat Voucher Manual'}
          </h3>
          <button onClick={onClose} className="text-[#FFFDF7]/70 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-xl mb-6 text-sm font-bold border border-red-200">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {selectedOrder && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-2">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Informasi Transaksi</p>
                <p className="text-sm font-semibold text-[#4B3832]">Invoice: {selectedOrder.invoiceNumber}</p>
                <p className="text-sm font-semibold text-[#4B3832]">Total Belanja: {formatRupiah(selectedOrder.grandTotal)}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-2">Nama Guide / Agen</label>
              <input 
                type="text" 
                required
                value={manualGuideName}
                onChange={e => setManualGuideName(e.target.value)}
                className="w-full px-4 py-3 bg-transparent rounded-xl border border-[#DCC7AA] focus:border-[#4B3832] outline-none font-semibold text-[#4B3832]"
                placeholder="Contoh: Pak Budi Travel"
              />
            </div>

            <div className="bg-white border border-[#DCC7AA]/50 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-black text-[#4B3832] text-sm uppercase tracking-wider border-b border-[#DCC7AA]/30 pb-2">Set Rewards</h4>
              
              {/* Cashback */}
              <div>
                <label className="block text-xs font-bold text-[#8B7355] mb-2">Cashback Tunai (Rp)</label>
                <input 
                  type="number"
                  min="0"
                  value={cashbackAmount}
                  onChange={e => setCashbackAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-transparent rounded-xl border border-[#DCC7AA] focus:border-[#4B3832] outline-none font-semibold text-[#4B3832]"
                  placeholder="0"
                />
              </div>

              {/* Diskon */}
              <div>
                <label className="block text-xs font-bold text-[#8B7355] mb-2">Diskon Pesanan Guide (%)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={e => setDiscountPercentage(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-transparent rounded-xl border border-[#DCC7AA] focus:border-[#4B3832] outline-none font-semibold text-[#4B3832]"
                  placeholder="0"
                />
              </div>

              {/* Makanan Gratis */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#8B7355]">Makanan Gratis</label>
                  <button 
                    type="button" 
                    onClick={handleAddFreeProduct}
                    className="text-[10px] bg-[#F5E6CA] text-[#6F4E37] hover:bg-[#DCC7AA] font-bold px-2 py-1 rounded-md transition-colors"
                  >
                    + Tambah Menu
                  </button>
                </div>
                
                {freeProducts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Tidak ada makanan gratis.</p>
                ) : (
                  <div className="space-y-3">
                    {freeProducts.map((fp, index) => {
                      const product = products.find(p => p._id === fp.productId);
                      return (
                        <div key={index} className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <span className="flex-1 px-2 text-sm font-semibold text-[#4B3832]">
                            {product ? product.name : 'Produk Tidak Ditemukan'}
                          </span>
                          <div className="flex items-center bg-white border border-[#DCC7AA] rounded-lg px-2">
                            <span className="text-[#8B7355] text-xs mr-2 font-bold">Qty</span>
                            <input
                              type="number"
                              min="1"
                              value={fp.quantity}
                              onChange={(e) => handleUpdateFreeProduct(index, 'quantity', Number(e.target.value))}
                              className="w-12 bg-transparent py-1 text-sm font-bold text-center outline-none focus:ring-0 text-[#4B3832]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFreeProduct(index)}
                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#4B3832] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#6F4E37] disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
              >
                {isSubmitting ? 'Memproses...' : 'Generate Kode Voucher'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <ProductSelectionModal 
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        products={products}
        categories={categories}
        onSelect={handleSelectProduct}
      />
    </div>
  );
}
