// src/components/pos/CategoryTabs.tsx
'use client';

import React from 'react';
import { Category } from '@/types/pos';

interface CategoryTabsProps {
  categories: Category[];
  activeCategorySlug: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategorySlug,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <nav 
      aria-label="Filter kategori menu" 
      className="bg-[#fffbeb] p-3 rounded-xl border-2 border-[#d6d3d1] shadow-sm"
    >
      <div 
        role="tablist" 
        className="flex flex-wrap items-center gap-2.5"
      >
        {categories.map((category) => {
          const isActive = category.slug === activeCategorySlug;
          return (
            <button
              key={category._id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onSelectCategory(category.slug)}
              className={`px-5 py-3 rounded-lg font-bold text-base border-2 cursor-pointer transition-colors ${
                isActive
                  ? 'bg-[#78350f] text-white border-[#451a03] shadow-md'
                  : 'bg-[#fefce8] text-[#451a03] border-[#d6d3d1] hover:bg-[#fef3c7] hover:border-[#a8a29e]'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
