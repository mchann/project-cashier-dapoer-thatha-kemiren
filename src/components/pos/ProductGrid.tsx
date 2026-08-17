// src/components/pos/ProductGrid.tsx
'use client';

import React from 'react';
import { Product } from '@/types/pos';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div 
        role="status"
        aria-live="polite"
        className="bg-[#FFFDF7] border-2 border-slate-300 rounded-xl p-8 text-center"
      >
        <p className="text-lg font-bold text-slate-700">
          Tidak ada menu yang sesuai dengan kategori ini.
        </p>
        <p className="text-sm text-slate-600 mt-1">
          Silakan pilih kategori lain atau cek ketersediaan stok dapur.
        </p>
      </div>
    );
  }

  return (
    <div 
      role="region" 
      aria-label="Katalog Menu Dapoer Thatha"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
