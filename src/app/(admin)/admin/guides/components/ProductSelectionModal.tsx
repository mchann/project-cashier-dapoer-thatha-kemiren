import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types/pos';
import Image from 'next/image';
void Image;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onSelect: (productId: string, quantity: number) => void;
}

export function ProductSelectionModal({ isOpen, onClose, products, categories, onSelect }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (activeCategory !== 'all') {
      result = result.filter(p => p.categoryId === activeCategory);
    }
    
    if (searchTerm.trim() !== '') {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return result;
  }, [products, activeCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#4B3832]/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="bg-[#FFFDF7] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-[#4B3832] px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-[#FFFDF7] font-black text-lg tracking-wide">Pilih Makanan Gratis</h3>
          <button onClick={onClose} className="text-[#FFFDF7]/70 hover:text-white transition-colors" title="Tutup">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-[#DCC7AA]/40 space-y-3 shrink-0">
          <input 
            type="text" 
            placeholder="Cari menu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#DCC7AA] rounded-xl font-bold text-[#4B3832] focus:outline-none focus:border-[#4B3832]"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-[#4B3832] text-white' : 'bg-[#F5E6CA] text-[#6F4E37] hover:bg-[#DCC7AA]'}`}
            >
              Semua Kategori
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat._id ? 'bg-[#4B3832] text-white' : 'bg-[#F5E6CA] text-[#6F4E37] hover:bg-[#DCC7AA]'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map(product => {
              const category = categories.find(c => c._id === product.categoryId);
              return (
                <div 
                  key={product._id} 
                  onClick={() => {
                    onSelect(product._id, 1);
                    onClose();
                  }}
                  className="bg-white border border-[#DCC7AA]/70 rounded-2xl p-3.5 cursor-pointer hover:border-[#4B3832] hover:bg-[#F5E6CA]/20 hover:shadow-md transition-all group flex flex-col justify-between gap-3 active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#4B3832] text-sm leading-tight group-hover:text-[#6F4E37] transition-colors">
                      {product.name}
                    </h4>
                    <span className="w-5 h-5 rounded-full bg-[#F5E6CA] group-hover:bg-[#4B3832] group-hover:text-white text-[#6F4E37] flex items-center justify-center shrink-0 transition-colors text-xs font-black">
                      +
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#DCC7AA]/20">
                    <span className="text-[10px] font-bold text-[#8B7355] bg-[#F5E6CA]/60 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                      {category?.name || 'Menu'}
                    </span>
                    <span className="text-xs font-extrabold text-[#4B3832]">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-8 text-[#8B7355] font-bold text-sm">
                Menu tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
