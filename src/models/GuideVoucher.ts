import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGuideVoucher extends Document {
  code: string;
  guideName: string;
  sourceTransactionId?: mongoose.Types.ObjectId;
  rewards: {
    cashbackAmount?: number;
    discountPercentage?: number;
    freeProducts?: Array<{
      productId: mongoose.Types.ObjectId;
      quantity: number;
    }>;
  };
  status: 'active' | 'used';
  usedAt?: Date;
  usedTransactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const guideVoucherSchema = new Schema<IGuideVoucher>(
  {
    code: { type: String, required: true, unique: true, index: true },
    guideName: { type: String, required: true },
    sourceTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    rewards: {
      cashbackAmount: { type: Number },
      discountPercentage: { type: Number },
      freeProducts: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
          quantity: { type: Number },
        },
      ],
    },
    status: { type: String, enum: ['active', 'used'], default: 'active' },
    usedAt: { type: Date },
    usedTransactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.GuideVoucher;
}

export const GuideVoucher: Model<IGuideVoucher> =
  mongoose.models.GuideVoucher || mongoose.model<IGuideVoucher>('GuideVoucher', guideVoucherSchema);
