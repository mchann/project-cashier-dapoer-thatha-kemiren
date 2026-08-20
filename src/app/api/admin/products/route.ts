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
    
    const formattedProducts = products.map(p => {
      const pObj = p.toObject();
      return {
        ...pObj,
        category: pObj.categoryId,
        categoryId: pObj.categoryId?._id || pObj.categoryId
      };
    });

    return NextResponse.json(formattedProducts);
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
    
    if (populatedProduct) {
      const pObj = populatedProduct.toObject();
      const formattedProduct = {
        ...pObj,
        category: pObj.categoryId,
        categoryId: pObj.categoryId?._id || pObj.categoryId
      };
      return NextResponse.json(formattedProduct, { status: 201 });
    }

    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal membuat menu' },
      { status: 500 }
    );
  }
}
