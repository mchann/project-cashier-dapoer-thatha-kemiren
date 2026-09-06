import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  image?: string;
  isUnlimited: boolean;
  rawMaterialId?: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Nama menu wajib diisi'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Harga wajib diisi'],
      min: [0, 'Harga tidak boleh negatif'],
    },
    stock: {
      type: Number,
      min: [0, 'Stok tidak boleh negatif'],
      default: 0,
    },
    isUnlimited: {
      type: Boolean,
      default: false,
    },
    rawMaterialId: {
      type: Schema.Types.ObjectId,
      ref: 'RawMaterial'
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Kategori wajib diisi'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}
export const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);
