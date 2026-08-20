import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { Settings } from '@/models/Settings';

// Ambil pengaturan
export async function GET() {
  try {
    await connectMongo();
    let settings = await Settings.findOne({});
    
    // Jika belum ada, buat pengaturan default
    if (!settings) {
      settings = await Settings.create({});
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil pengaturan' }, { status: 500 });
  }
}

// Update pengaturan
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await connectMongo();

    // Pastikan cuma ada 1 document
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings(body);
    } else {
      const updateData: any = {};
      if (body.receipt) updateData.receipt = { ...settings.receipt, ...body.receipt };
      if (body.reservation) updateData.reservation = { ...settings.reservation, ...body.reservation };
      if (body.landingPage) updateData.landingPage = { ...settings.landingPage, ...body.landingPage };
      if (body.pos) updateData.pos = { ...settings.pos, ...body.pos };

      settings = await Settings.findOneAndUpdate({}, { $set: updateData }, { new: true, strict: false });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan', detail: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
