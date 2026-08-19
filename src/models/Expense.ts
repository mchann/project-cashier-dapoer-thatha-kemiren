import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  quantity?: number;
  unit?: string;
  category: 'bahan_baku' | 'operasional' | 'lainnya';
  notes?: string;
  date: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'pcs' },
    category: { 
      type: String, 
      enum: ['bahan_baku', 'operasional', 'lainnya'],
      default: 'operasional'
    },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Expense;
}

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);
