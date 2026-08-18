import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { Product } from '@/models/Product';
// Import Category for population
import '@/models/Category';

export async function GET() {
  try {
    await connectMongo();
    const products = await Product.find({})
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data menu' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const { name, description, price, stock, image, categoryId, isAvailable } = body;

    if (!name || price === undefined || stock === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Nama, harga, stok, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      image,
      categoryId,
      isAvailable,
    });
    
    // Populate the newly created product to return complete data
    const populatedProduct = await Product.findById(newProduct._id).populate('categoryId', 'name');

    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal membuat menu' },
      { status: 500 }
    );
  }
}
