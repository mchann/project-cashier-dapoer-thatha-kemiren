import mongoose, { Schema, Document } from 'mongoose';

export interface ITransactionItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface ITransaction extends Document {
  invoiceNumber: string;
  tableNumber?: string;
  customerName: string;
  orderType: 'dine_in' | 'takeaway' | 'reservation' | 'qr_order';
  paymentStatus: 'unpaid' | 'dp_paid' | 'paid';
  items: ITransactionItem[];
  subtotal: number;
  dpAmount: number;
  discountAmount: number;
  guideCommission: number;
  guideCode?: string;
  guideName?: string;
  grandTotal: number;
  amountReceived: number;
  changeAmount: number;
  cashierName: string;
  cashierId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionItemSchema = new Schema<ITransactionItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const TransactionSchema = new Schema<ITransaction>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    tableNumber: { type: String, default: '' },
    customerName: { type: String, required: true },
    orderType: {
      type: String,
      enum: ['dine_in', 'takeaway', 'reservation', 'qr_order'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'dp_paid', 'paid'],
      required: true,
      default: 'paid',
    },
    items: [TransactionItemSchema],
    subtotal: { type: Number, required: true },
    dpAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    guideCommission: { type: Number, default: 0 },
    guideCode: { type: String, default: '' },
    guideName: { type: String, default: '' },
    grandTotal: { type: Number, required: true },
    amountReceived: { type: Number, required: true },
    changeAmount: { type: Number, required: true },
    cashierName: { type: String, required: true },
    cashierId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
