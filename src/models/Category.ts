import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Nama kategori wajib diisi'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug kategori wajib diisi'],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
