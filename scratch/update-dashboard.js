const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src/app/(admin)/admin/dashboard/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Add hooks import
pageContent = pageContent.replace(
  "import React from 'react';",
  "import React, { useState, useEffect } from 'react';"
);

// 2. Add State and Fetch Logic inside component
const fetchLogic = `  const [stats, setStats] = useState({
    revenueToday: 0,
    transactionsCount: 0,
    activeProductsCount: 0,
    pendingCount: 0,
    recentTransactions: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };
    fetchStats();
  }, []);`;

pageContent = pageContent.replace(
  "  const formatRupiah = (number: number) => {",
  `${fetchLogic}\n\n  const formatRupiah = (number: number) => {`
);

// 3. Replace Data in Cards
pageContent = pageContent.replace(
  /<h3 className="text-3xl font-black text-\[#FFFDF7\] tracking-tight mb-2">Rp 4,5Jt<\/h3>/g,
  '<h3 className="text-3xl font-black text-[#FFFDF7] tracking-tight mb-2">{formatRupiah(stats.revenueToday)}</h3>'
);

pageContent = pageContent.replace(
  /<h3 className="text-3xl font-black text-\[#4B3832\] tracking-tight mb-2">48<\/h3>/g,
  '<h3 className="text-3xl font-black text-[#4B3832] tracking-tight mb-2">{stats.transactionsCount}</h3>'
);

pageContent = pageContent.replace(
  /<h3 className="text-3xl font-black text-\[#4B3832\] tracking-tight mb-2">32<\/h3>/g,
  '<h3 className="text-3xl font-black text-[#4B3832] tracking-tight mb-2">{stats.activeProductsCount}</h3>'
);

pageContent = pageContent.replace(
  /<h3 className="text-3xl font-black text-\[#4B3832\] tracking-tight mb-2">12<\/h3>/g,
  '<h3 className="text-3xl font-black text-[#4B3832] tracking-tight mb-2">{stats.pendingCount}</h3>'
);

// 4. Replace Recent Transactions List
pageContent = pageContent.replace(
  /DUMMY_RECENT_TRANSACTIONS\.map\(\(tx\)/g,
  '(stats.recentTransactions.length > 0 ? stats.recentTransactions : []).map((tx)'
);

// Mongoose returns _id instead of id, tableNumber instead of table, customerName instead of name, grandTotal instead of total, etc
pageContent = pageContent.replace(
  /key=\{tx\.id\}/g,
  'key={tx._id || tx.id}'
);
pageContent = pageContent.replace(
  /Meja \{tx\.table\}/g,
  'Meja {tx.tableNumber || tx.table}'
);
pageContent = pageContent.replace(
  /\{tx\.name\}/g,
  '{tx.customerName || tx.name}'
);
pageContent = pageContent.replace(
  /\{tx\.time\}/g,
  '{new Date(tx.createdAt || tx.time).toLocaleTimeString(\'id-ID\', {hour: \'2-digit\', minute:\'2-digit\'})}'
);
pageContent = pageContent.replace(
  /\{formatRupiah\(tx\.total\)\}/g,
  '{formatRupiah(tx.grandTotal || tx.total)}'
);
pageContent = pageContent.replace(
  /\{tx\.status\}/g,
  '{tx.paymentStatus === \'paid\' ? \'Lunas\' : \'Gantung\'}'
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Dashboard page updated!');
