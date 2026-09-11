import React, { useState, useMemo } from 'react';
import { Product, Category } from '@/types/pos';
import Image from 'next/image';

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
          <button onClick={onClose} className="text-[#FFFDF7]/70 hover:text-white transition-colors">
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
            {filteredProducts.map(product => (
              <div 
                key={product._id} 
                onClick={() => {
                  onSelect(product._id, 1);
                  onClose();
                }}
                className="bg-white border border-[#DCC7AA]/50 rounded-2xl overflow-hidden cursor-pointer hover:border-[#4B3832] hover:shadow-md transition-all group flex flex-col"
              >
                <div className="relative h-24 bg-[#F5E6CA]">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#DCC7AA]">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-[#4B3832] text-sm leading-tight text-center">{product.name}</h4>
                </div>
              </div>
            ))}
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
