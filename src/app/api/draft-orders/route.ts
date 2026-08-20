import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { DraftOrder } from '@/models/DraftOrder';

function generateShortCode() {
  // Generate 4 digit number string
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const { customerName, tableNumber, items, isReservation, dpAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
    }

    let shortCode = generateShortCode();
    // Ensure uniqueness (simple retry logic)
    while (await DraftOrder.exists({ shortCode })) {
      shortCode = generateShortCode();
    }

    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999); // Expires end of day

    const draft = await DraftOrder.create({
      shortCode,
      customerName: customerName || 'Tamu',
      tableNumber: tableNumber || '',
      items,
      isReservation: isReservation || false,
      dpAmount: dpAmount || 0,
      expiresAt
    });

    return NextResponse.json({ success: true, shortCode: draft.shortCode });
  } catch (error: any) {
    console.error('DraftOrder POST error:', error);
    return NextResponse.json({ error: 'Gagal membuat draft pesanan' }, { status: 500 });
  }
}
