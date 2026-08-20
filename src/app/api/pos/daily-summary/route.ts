import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    // Hitung waktu awal dan akhir hari ini
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Ambil transaksi yang sudah lunas (paid) hari ini
    const todayTransactions = await Transaction.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      paymentStatus: 'paid',
    });

    const totalIncome = todayTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
    const successfulOrders = todayTransactions.length;

    // 2. Hitung jumlah pembatalan hari ini dari ActivityLog
    const cancelledLogs = await ActivityLog.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      title: { $regex: /batal|void/i },
    });

    return NextResponse.json({
      totalIncome,
      successfulOrders,
      cancelledOrders: cancelledLogs,
    });
  } catch (error: any) {
    console.error('Fetch Daily Summary Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil rekap harian' }, { status: 500 });
  }
}
