const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/admin/categories/[id]/route.ts',
  'src/app/api/admin/products/[id]/route.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/interface Params {\n  params: {\n    id: string;\n  };\n}/g, "interface Params {\n  params: Promise<{\n    id: string;\n  }>;\n}");
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed params type in', file);
  } else {
    console.log('Not found', file);
  }
});
