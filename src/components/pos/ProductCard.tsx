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
      aria-label={`Tambah ${product.name} ke pesanan. Harga ${formatRupiah(product.price)}. Stok porsi matang ${product.stock}.`}
      className={`group relative flex flex-col justify-between text-left rounded-xl border-2 p-3.5 transition-colors cursor-pointer ${
        isOutOfStock
          ? 'bg-[#f5f5f4] border-[#d6d3d1] opacity-60 cursor-not-allowed'
          : 'bg-white border-[#d6d3d1] hover:border-[#78350f] hover:bg-[#fffbeb] active:scale-[0.99] shadow-sm'
      }`}
    >
      {/* Bagian Atas: Kategori & Badge Stok */}
      <div className="flex items-center justify-between w-full mb-2 gap-2">
        <span className="text-xs font-bold text-[#57300a] uppercase tracking-wide px-2 py-0.5 rounded bg-[#fefce8] border border-[#d6d3d1]">
          {product.category?.name || 'Menu'}
        </span>
        <span
          className={`text-xs font-extrabold px-2.5 py-0.5 rounded border ${
            isOutOfStock
              ? 'bg-red-700 text-white border-red-900'
              : product.stock <= 5
              ? 'bg-[#fef08a] text-[#713f12] border-[#facc15]'
              : 'bg-[#fefce8] text-[#451a03] border-[#d97706]'
          }`}
        >
          {isOutOfStock ? 'HABIS' : `Stok: ${product.stock}`}
        </span>
      </div>

      {/* Bagian Tengah: Nama Menu */}
      <div className="my-2">
        <h3 className="font-extrabold text-lg text-[#291404] leading-snug line-clamp-2">
          {product.name}
        </h3>
      </div>

      {/* Bagian Bawah: Harga */}
      <div className="mt-3 pt-2 border-t-2 border-[#e7e5e4] flex items-center justify-between w-full">
        <span className="font-black text-xl text-[#78350f]">
          {formatRupiah(product.price)}
        </span>
        {!isOutOfStock && (
          <span className="bg-[#78350f] text-white font-bold text-sm px-3 py-1 rounded-lg border border-[#451a03]">
            + Tambah
          </span>
        )}
      </div>
    </button>
  );
}
