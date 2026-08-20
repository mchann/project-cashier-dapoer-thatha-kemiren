// src/components/admin/ProductTable.tsx
'use client';

import React, { useState } from 'react';
import { Product } from '@/types/pos';

interface ProductTableProps {
  products: Product[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string, productName: string) => void;
  onAdjustStock: (productId: string, delta: number) => void;
  onToggleAvailable: (productId: string, currentStatus: boolean) => void;
}

export function ProductTable({
  products,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
  onToggleAvailable,
}: ProductTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevProductCount, setPrevProductCount] = useState(products.length);
  const itemsPerPage = 10;

  // Render-phase state update (menggantikan useEffect) agar lulus lint
  if (products.length !== prevProductCount) {
    setCurrentPage(1);
    setPrevProductCount(products.length);
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-[#f5f5f4] rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="w-20 h-20 bg-[#fafaf9] rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[#d6d3d1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-[#78350f] font-semibold text-lg">Belum ada menu yang ditambahkan.</p>
        <p className="text-[#a8a29e] text-sm mt-1 max-w-sm">
          Silakan tambah menu baru atau sesuaikan filter pencarian Anda.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5E6CA] text-[#6F4E37] uppercase text-xs font-bold tracking-wider border-b border-[#DCC7AA]">
              <th className="p-4 rounded-tl-2xl w-12 text-center">No</th>
              <th className="p-4">Info Menu</th>
              <th className="p-4 text-right">Harga Jual</th>
              <th className="p-4 text-center">Stok (Porsi)</th>
              <th className="p-4 text-center">Status Jual</th>
              <th className="p-4 text-center rounded-tr-2xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCC7AA] bg-[#FFFDF7]">
            {paginatedProducts.map((p, index) => {
              const isOutOfStock = p.stock <= 0;
              const isOffline = !p.isAvailable;

              return (
                <tr
                  key={p._id}
                  className="hover:bg-[#F5E6CA] transition-colors duration-200 group"
                >
                  <td className="p-4 text-center font-bold text-[#6F4E37] text-sm">
                    {startIndex + index + 1}
                  </td>
                  {/* Kolom 1: Info Menu (Gambar & Nama) */}
                  <td className="p-4 min-w-[280px]">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#FFFDF7] border border-[#DCC7AA] flex-shrink-0 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML =
                                '<span class="flex items-center justify-center w-full h-full text-[10px] font-bold text-[#6F4E37] text-center p-1">No Image</span>';
                            }}
                          />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-xs font-bold text-[#6F4E37] bg-[#F5E6CA]">
                            IMG
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#4B3832] text-base leading-tight group-hover:text-[#6F4E37] transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#6F4E37] mt-1 line-clamp-1">
                          {p.category?.name || 'Umum'}
                        </p>
                        {p.description && (
                          <p className="text-[11px] text-[#4B3832]/70 mt-1.5 leading-snug line-clamp-2 max-w-xs">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Kolom 2: Harga */}
                  <td className="p-4 text-right align-top pt-5">
                    <div className="font-bold text-[#4B3832] text-sm">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(p.price)}
                    </div>
                  </td>

                  {/* Kolom 3: Stok Cepat */}
                  <td className="p-4 align-top pt-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onAdjustStock(p._id, -1)}
                        disabled={p.stock <= 0}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFFDF7] border border-[#DCC7AA] text-[#6F4E37] hover:border-[#ef4444] hover:text-[#ef4444] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        aria-label={`Kurangi stok ${p.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </button>

                      <div className="w-12 text-center">
                        <span
                          className={`text-lg font-black ${
                            isOutOfStock ? 'text-[#ef4444]' : 'text-[#4B3832]'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <span className="block text-[9px] font-bold text-[#DCC7AA] -mt-1 uppercase tracking-wider">
                          Porsi
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAdjustStock(p._id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFFDF7] border border-[#DCC7AA] text-[#6F4E37] hover:border-[#10b981] hover:text-[#10b981] transition-all shadow-sm"
                        aria-label={`Tambah stok ${p.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </td>

                  {/* Kolom 4: Status / Ketersediaan */}
                  <td className="p-4 text-center align-top pt-5">
                    <button
                      type="button"
                      onClick={() => onToggleAvailable(p._id, p.isAvailable || false)}
                      className={`px-3 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all border ${
                        isOffline
                          ? 'bg-[#fef2f2] text-[#ef4444] border-[#fecaca] hover:bg-[#fee2e2]'
                          : isOutOfStock
                          ? 'bg-[#fffbeb] text-[#d97706] border-[#fde68a] hover:bg-[#fef3c7]'
                          : 'bg-[#ecfdf5] text-[#10b981] border-[#a7f3d0] hover:bg-[#d1fae5]'
                      }`}
                    >
                      {isOffline ? '✖ OFF' : isOutOfStock ? 'HABIS' : '✔ AKTIF'}
                    </button>
                  </td>

                  {/* Kolom 5: Aksi (Edit / Hapus) */}
                  <td className="p-4 text-center align-top pt-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditProduct(p)}
                        className="p-2 bg-[#FFFDF7] text-[#6F4E37] rounded-xl border border-[#DCC7AA] hover:border-[#4B3832] hover:text-[#4B3832] hover:bg-[#F5E6CA] transition-all shadow-sm"
                        title="Edit Menu"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(p._id, p.name)}
                        className="p-2 bg-[#FFFDF7] text-[#ef4444] rounded-xl border border-[#DCC7AA] hover:border-[#ef4444] hover:bg-[#fef2f2] transition-all shadow-sm"
                        title="Hapus Menu"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#DCC7AA] bg-[#FFFDF7]">
          <p className="text-sm text-[#6F4E37] font-medium">
            Menampilkan <strong className="text-[#4B3832] font-bold">{startIndex + 1}</strong> -{' '}
            <strong className="text-[#4B3832] font-bold">
              {Math.min(startIndex + itemsPerPage, products.length)}
            </strong>{' '}
            dari <strong className="text-[#4B3832] font-bold">{products.length}</strong> menu
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-bold text-[#6F4E37] bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl hover:bg-[#F5E6CA] hover:border-[#4B3832] hover:text-[#4B3832] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Sebelumnnya
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                    currentPage === i + 1
                      ? 'bg-[#4B3832] text-[#FFFDF7] shadow-sm'
                      : 'text-[#6F4E37] hover:bg-[#F5E6CA]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-bold text-[#6F4E37] bg-[#FFFDF7] border border-[#DCC7AA] rounded-xl hover:bg-[#F5E6CA] hover:border-[#4B3832] hover:text-[#4B3832] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
