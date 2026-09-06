import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { Product } from '@/models/Product';
import ActivityLog from '@/models/ActivityLog';
import '@/models/Category';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await connectMongo();
    const body = await req.json();
    const { name, description, price, image, categoryId, isAvailable, isUnlimited, rawMaterialId } = body;
    const { id } = await params;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Nama, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
      return NextResponse.json(
        { error: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { 
        name, 
        description, 
        price, 
        image, 
        categoryId, 
        isAvailable,
        isUnlimited: isUnlimited || false,
        ...(rawMaterialId ? { rawMaterialId } : { $unset: { rawMaterialId: 1 } })
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    const pObj = updatedProduct!.toObject();
    const formattedProduct = {
      ...pObj,
      category: pObj.categoryId,
      categoryId: pObj.categoryId?._id || pObj.categoryId
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memperbarui menu' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectMongo();
    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Menu tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Menu berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus menu' },
      { status: 500 }
    );
  }
}
