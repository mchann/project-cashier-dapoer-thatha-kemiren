const fs = require('fs');
const path = require('path');

const absolutePath = path.join(__dirname, '..', 'src/app/(staff)/pos/page.tsx');
let content = fs.readFileSync(absolutePath, 'utf8');

const searchDataCat = `        setCategories(dataCat);`;
const replaceDataCat = `        // Tambahkan "Semua Menu" di paling depan
        setCategories([
          { _id: 'cat-all', name: 'Semua Menu', slug: 'all' },
          ...dataCat
        ]);`;

const searchDataProd = `        setProducts(dataProd.filter((p: Product) => p.isAvailable !== false));`;
const replaceDataProd = `        // Mongoose populate menggantikan categoryId dengan object, kita normalkan:
        const formattedProd = dataProd.map((p: any) => ({
          ...p,
          categoryId: p.categoryId?._id || p.categoryId,
          category: p.categoryId?._id ? p.categoryId : undefined
        }));
        setProducts(formattedProd.filter((p: any) => p.isAvailable !== false));`;

content = content.replace(searchDataCat, replaceDataCat);
content = content.replace(searchDataProd, replaceDataProd);

fs.writeFileSync(absolutePath, content, 'utf8');
console.log('Fixed pos/page.tsx data formatting');
