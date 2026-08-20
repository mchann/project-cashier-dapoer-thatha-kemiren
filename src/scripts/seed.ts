import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Kita define User schema secara lokal untuk seed agar tidak terikat dengan setup Next.js
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'staff'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI tidak ditemukan di .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB');

    const username = 'owner';
    const existingAdmin = await User.findOne({ username });

    if (existingAdmin) {
      console.log('⚠️ Akun Owner sudah ada di database!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('thatha123', 10);

    await User.create({
      name: 'Owner Dapoer Thatha',
      username,
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
    });

    console.log('🎉 Berhasil membuat akun Owner!');
    console.log('-----------------------------------');
    console.log('Username : taufikowner@gmail.com');
    console.log('Password : ownerdapoer#12');
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal melakukan seeding:', error);
    process.exit(1);
  }
}

seed();
