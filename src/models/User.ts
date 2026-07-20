// src/models/User.ts
import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Akan di-hash dengan bcrypt
    role: {
        type: String,
        enum: ['superadmin', 'staff'],
        required: true
    },
    isActive: { type: Boolean, default: true }, // Superadmin bisa menonaktifkan akun staff
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
export default User;