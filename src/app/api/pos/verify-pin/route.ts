import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { Settings } from '@/models/Settings';

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN wajib diisi' }, { status: 400 });
    }

    await connectMongo();
    
    // Ambil pengaturan
    const settings = await Settings.findOne({});
    
    // Default PIN jika belum di-set di DB adalah '1234'
    const validPin = settings?.pos?.cancellationPin || '1234';

    if (pin !== validPin) {
      return NextResponse.json({ error: 'PIN salah! Otorisasi ditolak.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'PIN valid' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memverifikasi PIN' },
      { status: 500 }
    );
  }
}
