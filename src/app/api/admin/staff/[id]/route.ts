import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    await connectMongo();
    const body = await req.json();
    const { username, password, isActive } = body;
    const name = username;
    const { id } = await params;

    if (!username) {
      return NextResponse.json(
        { error: 'Username wajib diisi' },
        { status: 400 }
      );
    }

    const staff = await User.findById(id);
    if (!staff) {
      return NextResponse.json(
        { error: 'Akun staff tidak ditemukan' },
        { status: 404 }
      );
    }

    // Periksa apakah email sudah digunakan akun lain
    const existingUser = await User.findOne({ username, _id: { $ne: id } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username sudah digunakan oleh pengguna lain' },
        { status: 400 }
      );
    }

    const updateData: any = { name, username, isActive };

    // Jika password baru diisi, maka update passwordnya
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStaff = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(updatedStaff);
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal memperbarui akun staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await connectMongo();
    const { id } = await params;

    const staff = await User.findById(id);
    if (!staff) {
      return NextResponse.json(
        { error: 'Akun staff tidak ditemukan' },
        { status: 404 }
      );
    }

    // Mencegah penghapusan superadmin lewat endpoint ini
    if (staff.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun Owner' },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Akun staff berhasil dihapus' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal menghapus akun staff' },
      { status: 500 }
    );
  }
}
