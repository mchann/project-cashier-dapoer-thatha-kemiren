const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src/app/(staff)/pos/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Tambah state dashboardStats
const statsState = `  const [fakturOrders, setFakturOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({ revenueToday: 0, transactionsCount: 0 });`;

pageContent = pageContent.replace(
  "  const [fakturOrders, setFakturOrders] = useState<Order[]>([]);\n  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);",
  statsState
);

// 2. Fetch stats
const fetchStats = `      const resStats = await fetch('/api/admin/dashboard');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setDashboardStats({ revenueToday: dataStats.revenueToday, transactionsCount: dataStats.transactionsCount });
      }
    } catch (err) {`;

pageContent = pageContent.replace(
  "    } catch (err) {",
  fetchStats
);

// 3. Pass stats to POSHeader
const headerProps = `<POSHeader
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenFakturGantung={() => setIsFakturModalOpen(true)}
        openOrdersCount={fakturOrders.length}
        totalOrders={dashboardStats.transactionsCount}
        totalRevenue={dashboardStats.revenueToday}
      />`;

pageContent = pageContent.replace(
  /<POSHeader[^>]*\/>/g,
  headerProps
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('POS Page dashboard stats updated!');
