import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { RawMaterial } from '@/models/RawMaterial';
import { Product } from '@/models/Product';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, stock, unit } = body;

    const updatedRawMaterial = await RawMaterial.findByIdAndUpdate(
      params.id,
      { name, stock: Number(stock), unit },
      { new: true, runValidators: true }
    );

    if (!updatedRawMaterial) {
      return NextResponse.json({ error: 'Bahan baku tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(updatedRawMaterial);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Bahan baku dengan nama ini sudah ada' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // Cek apakah ada menu yang masih terkait
    const linkedProducts = await Product.countDocuments({ rawMaterialId: params.id });
    if (linkedProducts > 0) {
      return NextResponse.json(
        { error: `Tidak bisa dihapus karena masih ada ${linkedProducts} menu yang tertaut ke bahan ini.` },
        { status: 400 }
      );
    }

    const deletedRawMaterial = await RawMaterial.findByIdAndDelete(params.id);

    if (!deletedRawMaterial) {
      return NextResponse.json({ error: 'Bahan baku tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bahan baku berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
