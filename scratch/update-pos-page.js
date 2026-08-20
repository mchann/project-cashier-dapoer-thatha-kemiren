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

const posPageReplacements = [
  // 1. Fetch real products and categories instead of dummy data
  {
    search: /const \[categories, setCategories\] = useState<Category\[\]>\(\n    DUMMY_CATEGORIES\.filter\(\(c\) => c\.slug !== 'all'\)\n  \);\n  const \[products, setProducts\] = useState<Product\[\]>\(DUMMY_PRODUCTS\);/g,
    replace: `const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch data dari database
  const fetchData = useCallback(async () => {
    try {
      const resCat = await fetch('/api/admin/categories');
      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategories(dataCat);
      }
      const resProd = await fetch('/api/admin/products');
      if (resProd.ok) {
        const dataProd = await resProd.json();
        // Filter out unavailable products or keep them but disabled
        setProducts(dataProd.filter((p: Product) => p.isAvailable !== false));
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);`
  },
  
  // 2. Change handleConfirmPayment to hit the API and refresh data
  {
    search: /const handleConfirmPayment = useCallback\(\(amountReceived: number, change: number\) => \{\n    if \(cartItems\.length === 0\) return;\n    const subtotal = cartItems\.reduce\(\(acc, i\) => acc \+ i\.price \* i\.quantity, 0\);\n    const grandTotal = Math\.max\(0, subtotal - dpAmount - guideCommission\);\n\n    setIsPaymentModalOpen\(false\);\n    \n    \/\/ Siapkan pesan notifikasi khusus\n    let notif = `PEMBAYARAN LUNAS BERHASIL! Meja \$\{tableNumber \|\| '-'\}. Total dibayar: Rp \$\{grandTotal\.toLocaleString\('id-ID'\)\}.`;\n    if \(change > 0\) \{\n      notif \+= ` Kembalian: Rp \$\{change\.toLocaleString\('id-ID'\)\}.`;\n    \}\n    \n    showNotification\(notif\);\n    handleClearCart\(\);\n  \}, \[cartItems, dpAmount, guideCommission, tableNumber, handleClearCart, showNotification\]\);/g,
    replace: `const handleConfirmPayment = useCallback(async (amountReceived: number, change: number) => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

    try {
      const res = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: \`INV-\${Date.now()}\`,
          tableNumber: orderType === 'takeaway' ? 'TA' : (tableNumber || '00'),
          customerName: customerName || (orderType === 'takeaway' ? 'Bungkus' : 'Dine In'),
          orderType,
          paymentStatus: 'paid',
          items: cartItems,
          subtotal,
          dpAmount,
          guideCommission,
          grandTotal,
          amountReceived,
          changeAmount: change
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses transaksi');
      }

      setIsPaymentModalOpen(false);
      
      let notif = \`PEMBAYARAN LUNAS BERHASIL! Meja \${tableNumber || '-'}. Total dibayar: Rp \${grandTotal.toLocaleString('id-ID')}.\`;
      if (change > 0) {
        notif += \` Kembalian: Rp \${change.toLocaleString('id-ID')}.\`;
      }
      
      showNotification(notif);
      handleClearCart();
      fetchData(); // Refresh stok dari database
      
    } catch (err: any) {
      alert(err.message);
    }
  }, [cartItems, dpAmount, guideCommission, tableNumber, orderType, customerName, handleClearCart, showNotification, fetchData]);`
  }
];

replaceFileContent('src/app/(staff)/pos/page.tsx', posPageReplacements);
