import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Konfigurasi Cloudinary dari Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Data gambar (base64) tidak ditemukan dalam request.' },
        { status: 400 }
      );
    }

    // Mengunggah gambar (berupa string base64) ke folder khusus di Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'dapoer_thatha_pos_menu',
      // Anda bisa menambahkan transformasi tambahan jika perlu, misal: width: 800, crop: 'limit'
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
    });
  } catch (error) {
    console.error('Error saat upload ke Cloudinary:', error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan saat mengunggah gambar ke server.' },
      { status: 500 }
    );
  }
}
