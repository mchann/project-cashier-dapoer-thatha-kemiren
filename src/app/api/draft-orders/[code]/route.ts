import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { DraftOrder } from '@/models/DraftOrder';
import { Product } from '@/models/Product'; // Ensure product is registered

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    await connectMongo();
    const { code } = await params;

    // Find and populate
    const draft = await DraftOrder.findOne({ shortCode: code }).populate('items.product');

    if (!draft) {
      return NextResponse.json({ error: 'Kode pesanan tidak ditemukan' }, { status: 404 });
    }

    // After pulling, delete the draft so it can't be used twice
    await DraftOrder.deleteOne({ _id: draft._id });

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error('DraftOrder GET error:', error);
    return NextResponse.json({ error: 'Gagal menarik pesanan' }, { status: 500 });
  }
}
