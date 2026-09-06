import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  stock: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

const RawMaterialSchema = new Schema<IRawMaterial>(
  {
    name: {
      type: String,
      required: [true, 'Nama bahan baku wajib diisi'],
      trim: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stok wajib diisi'],
      min: [0, 'Stok tidak boleh negatif'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Satuan wajib diisi (contoh: potong, porsi)'],
      trim: true,
      default: 'porsi',
    },
  },
  { timestamps: true }
);

export const RawMaterial: Model<IRawMaterial> =
  mongoose.models.RawMaterial || mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);
