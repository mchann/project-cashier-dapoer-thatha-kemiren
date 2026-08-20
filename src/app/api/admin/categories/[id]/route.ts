import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { Category } from '@/models/Category';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await connectMongo();
    const body = await req.json();
    const { name, slug } = body;
    const { id } = await params;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nama dan slug wajib diisi' },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if slug is taken by another category
    const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan oleh kategori lain' },
        { status: 400 }
      );
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memperbarui kategori' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectMongo();
    const { id } = await params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  }
}
