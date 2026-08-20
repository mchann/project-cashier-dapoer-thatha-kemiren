// src/components/pos/ProductCard.tsx
'use client';

import React from 'react';
import { Product } from '@/types/pos';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={() => onAddToCart(product)}
      aria-label={`Tambah ${product.name} ke pesanan. Harga ${formatRupiah(product.price)}.`}
      className={`group relative flex flex-col justify-between text-left p-3 transition-all duration-300 cursor-pointer border rounded-2xl min-h-[90px] overflow-hidden ${
        isOutOfStock
          ? 'bg-[#DCC7AA]/20 border-[#DCC7AA]/50 opacity-60 cursor-not-allowed'
          : 'bg-[#FFFDF7] border-[#DCC7AA]/40 shadow-sm hover:shadow-md hover:border-[#4B3832]/30 active:scale-[0.98]'
      }`}
    >
      {/* Detail Menu */}
      <div className="flex-1 pr-6 flex flex-col justify-center">
        <h3 className="font-bold text-[#4B3832] text-sm leading-snug mb-1 group-hover:text-[#6F4E37] transition-colors line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#6F4E37] text-xs">
            {formatRupiah(product.price)}
          </span>
          {!isOutOfStock && (
            <span className="text-[10px] font-bold text-[#8B7355] bg-[#F5E6CA]/50 px-1.5 py-0.5 rounded">
              Stok: {product.stock}
            </span>
          )}
        </div>
      </div>

      {/* Decorative circle icon background for abstract look */}
      <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none transform translate-x-1/3 -translate-y-1/3">
         <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
           <circle cx="12" cy="12" r="10" />
         </svg>
      </div>

      {/* Badge Stok Habis */}
      {isOutOfStock && (
        <span className="absolute top-4 right-4 text-[10px] font-black px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-200">
          HABIS
        </span>
      )}

      {/* Tombol Aksi (+) */}
      <div className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isOutOfStock 
          ? 'bg-[#DCC7AA]/30 text-[#6F4E37]/50' 
          : 'bg-[#FFFDF7] text-[#4B3832] border border-[#DCC7AA] group-hover:bg-[#4B3832] group-hover:text-[#FFFDF7] group-hover:border-[#4B3832] shadow-sm'
      }`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    </button>
  );
}
