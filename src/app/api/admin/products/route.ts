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
      .populate('rawMaterialId', 'name stock unit')
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
    const { name, description, price, image, categoryId, isAvailable, isUnlimited, rawMaterialId } = body;

    if (!name || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Nama, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      image,
      categoryId,
      isAvailable,
      isUnlimited: isUnlimited || false,
      ...(rawMaterialId ? { rawMaterialId } : {})
    });
    
    // Populate the newly created product to return complete data
    const populatedProduct = await Product.findById(newProduct._id)
      .populate('categoryId', 'name')
      .populate('rawMaterialId', 'name stock unit');
    
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
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: 'Gagal membuat menu: ' + (error as any).message },
      { status: 500 }
    );
  }
}
