import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDraftOrder extends Document {
  shortCode: string;
  customerName: string;
  tableNumber: string;
  items: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];
  isReservation?: boolean;
  dpAmount?: number;
  expiresAt: Date;
}

const draftOrderSchema = new Schema<IDraftOrder>(
  {
    shortCode: { type: String, required: true, unique: true },
    customerName: { type: String, default: 'Tamu' },
    tableNumber: { type: String, default: '' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    isReservation: { type: Boolean, default: false },
    dpAmount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: '1d' } } // Auto delete after 1 day
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.DraftOrder;
}

export const DraftOrder: Model<IDraftOrder> =
  mongoose.models.DraftOrder || mongoose.model<IDraftOrder>('DraftOrder', draftOrderSchema);
