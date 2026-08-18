const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacers) {
  const absolutePath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(absolutePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(absolutePath, 'utf8');
  for (const { search, replace } of replacers) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(absolutePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

// 1. StaffModal.tsx
replaceFileContent('src/components/admin/StaffModal.tsx', [
  { search: /const \[name, setName\] = useState\(initialData\?\.name \|\| ''\);\n/g, replace: "" },
  { search: /if \(\!name\.trim\(\)\) \{\n      setErrorMsg\('Nama staff tidak boleh kosong\.'\);\n      return;\n    \}\n/g, replace: "" },
  { search: /name: name\.trim\(\),/g, replace: "name: username.trim().toLowerCase()," },
  { search: /<div>\n              <label htmlFor="staff-name"[\s\S]*?<\/div>\n\n            <div>\n              <label htmlFor="staff-username"/g, replace: "<div>\n              <label htmlFor=\"staff-username\"" }
]);

// 2. staff/page.tsx
replaceFileContent('src/app/(admin)/admin/staff/page.tsx', [
  { search: /<th className="py-5 px-8 font-bold text-\[\#4B3832\]">Nama Lengkap<\/th>\n/g, replace: "" },
  { search: /<td className="py-5 px-8">\n                      <div className="font-bold text-\[\#4B3832\]">\{staff\.name\}<\/div>\n                    <\/td>\n                    <td className="py-5 px-8">\n                      <div className="text-\[\#6F4E37\]">\{staff\.username\}<\/div>\n                    <\/td>/g, replace: "<td className=\"py-5 px-8\">\n                      <div className=\"font-bold text-[#4B3832]\">{staff.username}</div>\n                    </td>" }
]);

// 3. staff/route.ts
replaceFileContent('src/app/api/admin/staff/route.ts', [
  { search: /const \{ name, username, password, isActive \} = body;/g, replace: "const { username, password, isActive } = body;\n    const name = username;" },
  { search: /if \(\!name \|\| \!username \|\| \!password\)/g, replace: "if (!username || !password)" },
  { search: /Nama, username, dan password wajib diisi/g, replace: "Username dan password wajib diisi" }
]);

// 4. staff/[id]/route.ts
replaceFileContent('src/app/api/admin/staff/[id]/route.ts', [
  { search: /const \{ name, username, password, isActive \} = body;/g, replace: "const { username, password, isActive } = body;\n    const name = username;" },
  { search: /if \(\!name \|\| \!username\)/g, replace: "if (!username)" },
  { search: /Nama dan username wajib diisi/g, replace: "Username wajib diisi" }
]);
