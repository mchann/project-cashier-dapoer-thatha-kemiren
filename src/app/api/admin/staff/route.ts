import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectMongo();
    // Ambil semua user dengan role 'staff', tanpa mengambil password
    const staff = await User.find({ role: 'staff' })
      .select('-password')
      .sort({ createdAt: -1 });
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal mengambil data staff' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    const body = await req.json();
    const { username, password, isActive } = body;
    const name = username;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await User.create({
      name,
      username,
      password: hashedPassword,
      role: 'staff',
      isActive: isActive !== undefined ? isActive : true,
    });

    // Hapus password dari response
    const staffResponse = newStaff.toObject();
    delete staffResponse.password;

    return NextResponse.json(staffResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal membuat akun staff' },
      { status: 500 }
    );
  }
}
