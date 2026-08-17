// src/scripts/seed-admin.ts
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import * as dotenv from "dotenv";

// Load environment variables dari .env.local
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI tidak ditemukan di .env.local");
    process.exit(1);
}

async function seedSuperAdmin() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log("✅ Terhubung ke database MongoDB");

        // Cek apakah superadmin sudah ada
        const existingAdmin = await User.findOne({ role: "superadmin" });
        if (existingAdmin) {
            console.log("⚠️ Super Admin sudah ada di database!");
            process.exit(0);
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash("dapoer#_123", 10);

        // Buat akun Super Admin
        await User.create({
            name: "Owner Taufik",
            email: "dapoerthathaowner91@resto.com",
            password: hashedPassword,
            role: "superadmin",
        });

        console.log("✅ Berhasil membuat akun Super Admin!");
        console.log("Email: dapoerthathaowner91@resto.com");
        console.log("Password: dapoer#_123");
    } catch (error) {
        console.error("❌ Gagal membuat Super Admin:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Koneksi database ditutup.");
        process.exit(0);
    }
}

seedSuperAdmin();