const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/admin/categories/route.ts',
  'src/app/api/admin/categories/[id]/route.ts',
  'src/app/api/admin/products/route.ts',
  'src/app/api/admin/products/[id]/route.ts',
  'src/app/api/auth/[...nextauth]/route.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/import \{ connectToDatabase \} from '@\/lib\/mongodb';/g, "import connectMongo from '@/lib/mongodb';");
    content = content.replace(/await connectToDatabase\(\);/g, "await connectMongo();");
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', file);
  } else {
    console.log('Not found', file);
  }
});
