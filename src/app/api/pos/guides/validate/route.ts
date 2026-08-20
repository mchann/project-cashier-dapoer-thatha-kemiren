import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { GuideVoucher } from '@/models/GuideVoucher';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Kode tidak boleh kosong' }, { status: 400 });
    }

    await connectMongo();

    const voucher = await GuideVoucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return NextResponse.json({ error: 'Kode tidak valid atau tidak ditemukan' }, { status: 404 });
    }

    if (voucher.status === 'used') {
      return NextResponse.json({ error: 'Kode ini sudah pernah digunakan' }, { status: 400 });
    }

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Error validating guide voucher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
