const fs = require('fs');
const path = require('path');

const tabsPath = path.join(__dirname, '..', 'src/components/pos/CategoryTabs.tsx');
let tabsContent = fs.readFileSync(tabsPath, 'utf8');

tabsContent = tabsContent.replace(
  'activeCategorySlug: string;\n  onSelectCategory: (slug: string) => void;\n}',
  'activeCategorySlug: string;\n  onSelectCategory: (slug: string) => void;\n  menuCounts: Record<string, number>;\n}'
);

tabsContent = tabsContent.replace(
  'activeCategorySlug,\n  onSelectCategory,\n}: CategoryTabsProps) {',
  'activeCategorySlug,\n  onSelectCategory,\n  menuCounts,\n}: CategoryTabsProps) {'
);

tabsContent = tabsContent.replace(
  '<p className={`text-xs mt-1 ${isActive ? \'text-[#FFFDF7]/70\' : \'text-[#6F4E37]/70\'}`}>\n                  15 menu\n                </p>',
  '<p className={`text-xs mt-1 ${isActive ? \'text-[#FFFDF7]/70\' : \'text-[#6F4E37]/70\'}`}>\n                  {menuCounts[category._id] || 0} menu\n                </p>'
);

fs.writeFileSync(tabsPath, tabsContent, 'utf8');

const pagePath = path.join(__dirname, '..', 'src/app/(staff)/pos/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const menuCountsHook = `  // --- Hitung Jumlah Menu per Kategori ---
  const menuCounts = useMemo(() => {
    const counts: Record<string, number> = { 'cat-all': products.length };
    products.forEach((p) => {
      const catId = typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId;
      counts[catId] = (counts[catId] || 0) + 1;
    });
    return counts;
  }, [products]);`;

pageContent = pageContent.replace(
  '// --- Filter Produk berdasarkan Kategori & Pencarian ---',
  `${menuCountsHook}\n\n  // --- Filter Produk berdasarkan Kategori & Pencarian ---`
);

pageContent = pageContent.replace(
  '<CategoryTabs\n            categories={categories}\n            activeCategorySlug={activeCategorySlug}\n            onSelectCategory={setActiveCategorySlug}\n          />',
  '<CategoryTabs\n            categories={categories}\n            activeCategorySlug={activeCategorySlug}\n            onSelectCategory={setActiveCategorySlug}\n            menuCounts={menuCounts}\n          />'
);

fs.writeFileSync(pagePath, pageContent, 'utf8');

console.log('Category menu counts updated!');
