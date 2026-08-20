import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { Product } from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    // Hitung hari ini dari jam 00:00 sampai 23:59
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayTransactions = await Transaction.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: 'paid'
    });

    const revenueToday = todayTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
    const transactionsCount = todayTransactions.length;

    // Optional: Hitung total menu aktif (untuk dashboard Owner)
    const activeProductsCount = await Product.countDocuments({ isAvailable: true });

    // Optional: Hitung pesanan menggantung
    const pendingCount = await Transaction.countDocuments({ paymentStatus: 'unpaid' });

    const sortedTransactions = [...todayTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      revenueToday,
      transactionsCount,
      activeProductsCount,
      pendingCount,
      recentTransactions: sortedTransactions.slice(0, 5) // 5 transaksi terbaru
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Gagal memuat statistik dashboard' }, { status: 500 });
  }
}
