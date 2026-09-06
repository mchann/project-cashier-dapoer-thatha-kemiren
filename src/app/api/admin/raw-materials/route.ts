import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { RawMaterial } from '@/models/RawMaterial';
import { Product } from '@/models/Product';

export async function GET() {
  try {
    await dbConnect();
    // Ambil semua raw materials
    const rawMaterials = await RawMaterial.find({}).sort({ createdAt: -1 }).lean();
    
    // Hitung jumlah menu yang terkait dengan masing-masing raw material
    // Ini berguna untuk di UI agar tahu berapa menu yang terhubung
    const result = await Promise.all(
      rawMaterials.map(async (rm) => {
        const linkedProductsCount = await Product.countDocuments({ rawMaterialId: rm._id });
        return {
          ...rm,
          linkedProductsCount
        };
      })
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, stock, unit } = body;

    if (!name || stock === undefined || !unit) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const newRawMaterial = await RawMaterial.create({
      name,
      stock: Number(stock),
      unit
    });

    return NextResponse.json(newRawMaterial, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Bahan baku dengan nama ini sudah ada' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
