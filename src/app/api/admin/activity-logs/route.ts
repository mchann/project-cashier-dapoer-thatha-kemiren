import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export async function GET(req: Request) {
  try {
    await connectMongo();
    
    // Validasi session
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil log aktivitas (karena sudah TTL 10 hari, mungkin aman untuk load semua atau top 500)
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(500);

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil log aktivitas' },
      { status: 500 }
    );
  }
}
