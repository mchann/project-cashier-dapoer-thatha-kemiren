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

// 1. User.ts
replaceFileContent('src/models/User.ts', [
  { search: /email: \{ type: String, required: true, unique: true \},/g, replace: "username: { type: String, required: true, unique: true }," }
]);

// 2. next-auth.d.ts
replaceFileContent('src/types/next-auth.d.ts', [
  { search: /interface User \{\n    id: string;\n    role: string;\n  \}/g, replace: "interface User {\n    id: string;\n    role: string;\n    username: string;\n  }" },
  { search: /user: User & \{\n      id: string;\n      role: string;\n    \};/g, replace: "user: User & {\n      id: string;\n      role: string;\n      username: string;\n    };" }
]);

// 3. auth route.ts
replaceFileContent('src/app/api/auth/[...nextauth]/route.ts', [
  { search: /email: \{ label: 'Email', type: 'text' \}/g, replace: "username: { label: 'Username', type: 'text' }" },
  { search: /!credentials\?\.email/g, replace: "!credentials?.username" },
  { search: /'Email dan password wajib diisi'/g, replace: "'Username dan password wajib diisi'" },
  { search: /email: credentials\.email/g, replace: "username: credentials.username" },
  { search: /email: user\.email/g, replace: "username: user.username" },
  { search: /token\.role = user\.role;/g, replace: "token.role = user.role;\n        token.username = user.username;" },
  { search: /session\.user\.role = token\.role as string;/g, replace: "session.user.role = token.role as string;\n        session.user.username = token.username as string;" }
]);

// 4. login page.tsx
replaceFileContent('src/app/(auth)/login/page.tsx', [
  { search: /const \[email, setEmail\] = useState\(''\);/g, replace: "const [username, setUsername] = useState('');" },
  { search: /email,/g, replace: "username," },
  { search: /Alamat Email/g, replace: "Username" },
  { search: /type="email"/g, replace: "type=\"text\"" },
  { search: /placeholder="Masukkan email Anda"/g, replace: "placeholder=\"Masukkan username\"" },
  { search: /value=\{email\}/g, replace: "value={username}" },
  { search: /onChange=\{\(e\) => setEmail\(e\.target\.value\)\}/g, replace: "onChange={(e) => setUsername(e.target.value)}" }
]);

// 5. staff route.ts
replaceFileContent('src/app/api/admin/staff/route.ts', [
  { search: /const \{ name, email, password, isActive \} = body;/g, replace: "const { name, username, password, isActive } = body;" },
  { search: /if \(\!name \|\| \!email \|\| \!password\)/g, replace: "if (!name || !username || !password)" },
  { search: /Nama, email, dan password wajib diisi/g, replace: "Nama, username, dan password wajib diisi" },
  { search: /User\.findOne\(\{ email \}\)/g, replace: "User.findOne({ username })" },
  { search: /Email sudah terdaftar/g, replace: "Username sudah terdaftar" },
  { search: /email,/g, replace: "username," }
]);

// 6. staff [id] route.ts
replaceFileContent('src/app/api/admin/staff/[id]/route.ts', [
  { search: /const \{ name, email, password, isActive \} = body;/g, replace: "const { name, username, password, isActive } = body;" },
  { search: /if \(\!name \|\| \!email\)/g, replace: "if (!name || !username)" },
  { search: /Nama dan email wajib diisi/g, replace: "Nama dan username wajib diisi" },
  { search: /User\.findOne\(\{ email, _id: \{ \$ne: id \} \}\)/g, replace: "User.findOne({ username, _id: { $ne: id } })" },
  { search: /Email sudah digunakan oleh pengguna lain/g, replace: "Username sudah digunakan oleh pengguna lain" },
  { search: /const updateData: any = \{ name, email, isActive \};/g, replace: "const updateData: any = { name, username, isActive };" }
]);

// 7. StaffModal.tsx
replaceFileContent('src/components/admin/StaffModal.tsx', [
  { search: /email: string;/g, replace: "username: string;" },
  { search: /const \[email, setEmail\] = useState\(initialData\?\.email \|\| ''\);/g, replace: "const [username, setUsername] = useState(initialData?.username || '');" },
  { search: /if \(\!email\.trim\(\) \|\| \!email\.includes\('@'\)\) \{\n      setErrorMsg\('Email tidak valid\.'\);\n      return;\n    \}/g, replace: "if (!username.trim()) {\n      setErrorMsg('Username tidak boleh kosong.');\n      return;\n    }" },
  { search: /email: email\.trim\(\),/g, replace: "username: username.trim().toLowerCase()," }, // added lowercase for username sanitization
  { search: /Alamat Email \(Login\)/g, replace: "Username (Untuk Login)" },
  { search: /id="staff-email"/g, replace: "id=\"staff-username\"" },
  { search: /type="email"/g, replace: "type=\"text\"" },
  { search: /value=\{email\}/g, replace: "value={username}" },
  { search: /onChange=\{\(e\) => \{\n                  setEmail\(e\.target\.value\);/g, replace: "onChange={(e) => {\n                  setUsername(e.target.value.replace(/\\\\s+/g, '').toLowerCase());" },
  { search: /placeholder="siti@dapoerthatha\.com"/g, replace: "placeholder=\"contoh: siti\"" }
]);

// 8. AdminStaffPage
replaceFileContent('src/app/(admin)/admin/staff/page.tsx', [
  { search: /Email Login/g, replace: "Username Login" },
  { search: /staff\.email/g, replace: "staff.username" }
]);

// 9. seed.ts
replaceFileContent('src/scripts/seed.ts', [
  { search: /email: \{ type: String, required: true, unique: true \},/g, replace: "username: { type: String, required: true, unique: true }," },
  { search: /const email = 'owner@dapoerthatha\.com';/g, replace: "const username = 'owner';" },
  { search: /User\.findOne\(\{ email \}\);/g, replace: "User.findOne({ username });" },
  { search: /email,/g, replace: "username," },
  { search: /Email    : owner@dapoerthatha\.com/g, replace: "Username : owner" }
]);
