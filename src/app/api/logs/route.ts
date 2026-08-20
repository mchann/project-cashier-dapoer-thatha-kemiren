import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'admin' atau 'staff'
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Ambil log yang sesuai targetRole ('all' akan masuk ke keduanya)
    const filter = role ? { targetRole: { $in: [role, 'all'] } } : {};

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Fetch Logs Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil log aktivitas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();

    // Pastikan user login (baik admin maupun staff boleh membuat log)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, type, targetRole, metadata } = body;

    if (!title || !message || !targetRole) {
      return NextResponse.json({ error: 'Title, message, dan targetRole wajib diisi' }, { status: 400 });
    }

    const log = await ActivityLog.create({
      title,
      message,
      type: type || 'info',
      targetRole,
      metadata,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error('Create Log Error:', error);
    return NextResponse.json({ error: 'Gagal membuat log aktivitas' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectMongo();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role wajib diisi' }, { status: 400 });
    }

    // Tandai semua log untuk role ini (dan 'all') sebagai terbaca
    await ActivityLog.updateMany(
      { targetRole: { $in: [role, 'all'] }, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: 'Log berhasil ditandai terbaca' });
  } catch (error: any) {
    console.error('Mark Read Error:', error);
    return NextResponse.json({ error: 'Gagal menandai log' }, { status: 500 });
  }
}
