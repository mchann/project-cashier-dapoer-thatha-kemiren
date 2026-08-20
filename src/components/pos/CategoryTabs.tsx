// src/components/pos/CategoryTabs.tsx
'use client';

import React from 'react';
import { Category } from '@/types/pos';

interface CategoryTabsProps {
  categories: Category[];
  activeCategorySlug: string;
  onSelectCategory: (slug: string) => void;
  menuCounts: Record<string, number>;
}

export function CategoryTabs({
  categories,
  activeCategorySlug,
  onSelectCategory,
  menuCounts,
}: CategoryTabsProps) {
  // Gunakan categories langsung tanpa prepend "Semua Menu" karena sudah ada di data sumber
  const displayCategories = categories;

  return (
    <nav 
      aria-label="Filter kategori menu" 
      className="w-full overflow-x-auto pb-2 scrollbar-hide"
    >
      <div 
        role="tablist" 
        className="flex items-center gap-4 min-w-max"
      >
        {displayCategories.map((category) => {
          const isActive = category.slug === activeCategorySlug;
          return (
            <button
              key={category._id}
              role="tab"
              type="button"
              data-state={isActive ? 'active' : 'inactive'}
              onClick={() => onSelectCategory(category.slug)}
              className={`relative text-left flex flex-col justify-between w-40 md:w-48 h-32 p-4 rounded-3xl transition-all duration-300 border overflow-hidden ${
                isActive
                  ? 'bg-[#4B3832] text-[#FFFDF7] border-[#4B3832] shadow-lg shadow-[#4B3832]/20'
                  : 'bg-[#FFFDF7] text-[#4B3832] border-[#DCC7AA] hover:border-[#4B3832] hover:bg-[#F5E6CA] shadow-sm'
              }`}
            >
              {/* Badge "Available" */}
              <div className="flex justify-between items-start z-10">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${
                  isActive ? 'border-[#FFFDF7]/30 text-[#FFFDF7]' : 'border-[#DCC7AA] text-[#4B3832]'
                }`}>
                  Tersedia
                </span>
              </div>
              
              {/* Title & Items Count */}
              <div className="z-10 mt-auto">
                <h3 className="font-bold text-lg leading-tight">{category.name}</h3>
                <p className={`text-xs mt-1 ${isActive ? 'text-[#FFFDF7]/70' : 'text-[#6F4E37]/70'}`}>
                  {menuCounts[category._id] || 0} menu
                </p>
              </div>

              {/* Decorative Abstract Shape */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${
                isActive ? 'bg-[#FFFDF7]' : 'bg-[#4B3832]'
              }`}></div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
