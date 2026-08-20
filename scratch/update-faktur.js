const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src/app/(staff)/pos/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Tambahkan state activeOrderId dan fakturOrders (hapus useMemo)
pageContent = pageContent.replace(
  "  const fakturOrders = useMemo(() => DUMMY_FAKTUR_GANTUNG.filter((o) => o.paymentStatus !== 'paid'), []);",
  "  const [fakturOrders, setFakturOrders] = useState<Order[]>([]);\n  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);"
);

// 2. Tambah fetch pending orders di fetchData
const fetchPending = `
      const resPending = await fetch('/api/pos/transactions/pending');
      if (resPending.ok) {
        const dataPending = await resPending.json();
        setFakturOrders(dataPending);
      }`;
pageContent = pageContent.replace(
  "const dataProd = await resProd.json();",
  `const dataProd = await resProd.json();${fetchPending}`
);

// 3. handleLoadFaktur: set activeOrderId
pageContent = pageContent.replace(
  "setDpAmount(order.dpAmount || 0);",
  "setDpAmount(order.dpAmount || 0);\n    setActiveOrderId(order._id);"
);

// 4. handleClearCart: reset activeOrderId
pageContent = pageContent.replace(
  "setCustomerName('');",
  "setCustomerName('');\n    setActiveOrderId(null);"
);

// 5. handleSaveFakturGantung
const newHandleSaveFakturGantung = `const handleSaveFakturGantung = useCallback(async () => {
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
          paymentStatus: 'unpaid',
          items: cartItems,
          subtotal,
          dpAmount,
          guideCommission,
          grandTotal,
          amountReceived: 0,
          changeAmount: 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan faktur');

      showNotification(\`Pesanan Meja \${tableNumber || '00'} berhasil disimpan ke antrean Faktur Gantung.\`);
      handleClearCart();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  }, [
    cartItems, orderType, tableNumber, customerName, dpAmount, guideCommission,
    handleClearCart, showNotification, fetchData
  ]);`;

// Hapus handleSaveFakturGantung yang lama
const startIdxSave = pageContent.indexOf('const handleSaveFakturGantung = useCallback(() => {');
const endIdxSave = pageContent.indexOf(']);', startIdxSave) + 3;
if (startIdxSave !== -1) {
  pageContent = pageContent.substring(0, startIdxSave) + newHandleSaveFakturGantung + pageContent.substring(endIdxSave);
}

// 6. handleConfirmPayment: hit PATCH if activeOrderId exists
const newHandleConfirmPayment = `const handleConfirmPayment = useCallback(async (amountReceived: number, change: number) => {
    if (cartItems.length === 0) return;
    const subtotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const grandTotal = Math.max(0, subtotal - dpAmount - guideCommission);

    try {
      let res;
      if (activeOrderId) {
        // Lunasi faktur gantung
        res = await fetch(\`/api/pos/transactions/\${activeOrderId}\`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentStatus: 'paid',
            amountReceived,
            changeAmount: change
          })
        });
      } else {
        // Transaksi baru langsung lunas
        res = await fetch('/api/pos/transactions', {
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
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses transaksi');

      setIsPaymentModalOpen(false);
      
      let notif = \`PEMBAYARAN LUNAS BERHASIL! Meja \${tableNumber || '-'}. Total dibayar: Rp \${grandTotal.toLocaleString('id-ID')}.\`;
      if (change > 0) notif += \` Kembalian: Rp \${change.toLocaleString('id-ID')}.\`;
      
      showNotification(notif);
      handleClearCart();
      fetchData();
      
    } catch (err: any) {
      alert(err.message);
    }
  }, [cartItems, dpAmount, guideCommission, tableNumber, orderType, customerName, activeOrderId, handleClearCart, showNotification, fetchData]);`;

const startIdxConfirm = pageContent.indexOf('const handleConfirmPayment = useCallback(async (amountReceived: number, change: number) => {');
const endIdxConfirm = pageContent.indexOf(']);', startIdxConfirm) + 3;
if (startIdxConfirm !== -1) {
  pageContent = pageContent.substring(0, startIdxConfirm) + newHandleConfirmPayment + pageContent.substring(endIdxConfirm);
}

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('POS Page updated for dynamic faktur gantung!');
