import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGuideVoucher extends Document {
  code: string;
  guideName: string;
  rewardType: 'discount' | 'cashback';
  amountType: 'percentage' | 'nominal';
  amount: number;
  status: 'active' | 'used';
  usedAt?: Date;
  transactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const guideVoucherSchema = new Schema<IGuideVoucher>(
  {
    code: { type: String, required: true, unique: true, index: true },
    guideName: { type: String, required: true },
    rewardType: { type: String, enum: ['discount', 'cashback'], required: true },
    amountType: { type: String, enum: ['percentage', 'nominal'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'used'], default: 'active' },
    usedAt: { type: Date },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.GuideVoucher;
}

export const GuideVoucher: Model<IGuideVoucher> =
  mongoose.models.GuideVoucher || mongoose.model<IGuideVoucher>('GuideVoucher', guideVoucherSchema);
