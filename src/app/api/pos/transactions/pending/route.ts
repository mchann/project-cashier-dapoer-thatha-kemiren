import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    // Ambil semua transaksi yang statusnya 'unpaid'
    const pendingOrders = await Transaction.find({ paymentStatus: 'unpaid' }).sort({ createdAt: -1 });
    
    return NextResponse.json(pendingOrders);
  } catch (error: any) {
    console.error('Fetch pending transactions error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pesanan belum lunas' }, { status: 500 });
  }
}
