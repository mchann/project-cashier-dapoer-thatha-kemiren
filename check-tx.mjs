import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    invoiceNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    orderType: { type: String, enum: ['dine_in', 'takeaway', 'reservation', 'qr_order'], required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'dp_paid', 'paid', 'void'], required: true },
    items: [],
    subtotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },
    amountReceived: { type: Number, required: true },
    changeAmount: { type: Number, required: true },
    cashierName: { type: String, required: true },
  }, { strict: false }));
  
  const newTx = new Transaction({
    invoiceNumber: 'INV-TEST-123',
    customerName: 'Test Customer',
    orderType: 'dine_in',
    paymentStatus: 'unpaid',
    subtotal: 10000,
    grandTotal: 10000,
    amountReceived: 0,
    changeAmount: 0,
    cashierName: 'Test Cashier'
  });
  
  await newTx.save();
  console.log('Saved unpaid tx');

  newTx.paymentStatus = 'void';
  await newTx.save();
  console.log('Saved void tx');

  const check = await Transaction.findOne({ invoiceNumber: 'INV-TEST-123' });
  console.log('Check void tx:', check?.paymentStatus);

  process.exit(0);
}

run().catch(console.error);
