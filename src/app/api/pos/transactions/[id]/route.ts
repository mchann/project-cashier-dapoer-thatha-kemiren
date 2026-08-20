import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { Product } from '@/models/Product';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    const resolvedParams = await params;
    const transactionId = resolvedParams.id;
    const body = await req.json();
    const { paymentStatus, amountReceived, changeAmount } = body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Update status bayar
    transaction.paymentStatus = paymentStatus;
    if (amountReceived !== undefined) transaction.amountReceived = amountReceived;
    if (changeAmount !== undefined) transaction.changeAmount = changeAmount;

    await transaction.save();

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui transaksi' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    const resolvedParams = await params;
    const transactionId = resolvedParams.id;
    const body = await req.json();

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Kita izinkan mengubah pesanan yang masih unpaid
    if (transaction.paymentStatus !== 'unpaid') {
      return NextResponse.json({ error: 'Tidak dapat mengubah transaksi yang sudah dibayar/DP' }, { status: 400 });
    }

    // Hitung perbedaan item yang dikurangi / dihapus
    const oldItems = transaction.items || [];
    const newItems = body.items || [];
    const voidedDiff: any[] = [];
    
    const stockDiffOps: any[] = [];
    
    oldItems.forEach((oldItem: any) => {
      const newItem = newItems.find((i: any) => i.productId.toString() === oldItem.productId.toString());
      if (!newItem) {
        // Item dihapus sepenuhnya
        voidedDiff.push({
          name: oldItem.name,
          quantity: oldItem.quantity,
          price: oldItem.price,
          date: new Date()
        });
        stockDiffOps.push({
          updateOne: {
            filter: { _id: oldItem.productId },
            update: { $inc: { stock: oldItem.quantity } }
          }
        });
      } else {
        const qtyDiff = newItem.quantity - oldItem.quantity;
        if (qtyDiff < 0) {
          // Porsi dikurangi
          voidedDiff.push({
            name: oldItem.name,
            quantity: Math.abs(qtyDiff),
            price: oldItem.price,
            date: new Date()
          });
          stockDiffOps.push({
            updateOne: {
              filter: { _id: oldItem.productId },
              update: { $inc: { stock: Math.abs(qtyDiff) } }
            }
          });
        } else if (qtyDiff > 0) {
          // Porsi ditambah
          stockDiffOps.push({
            updateOne: {
              filter: { _id: oldItem.productId, stock: { $gte: qtyDiff } },
              update: { $inc: { stock: -qtyDiff } }
            }
          });
        }
      }
    });

    newItems.forEach((newItem: any) => {
      const oldItem = oldItems.find((i: any) => i.productId.toString() === newItem.productId.toString());
      if (!oldItem) {
        // Menu baru ditambahkan
        stockDiffOps.push({
          updateOne: {
            filter: { _id: newItem.productId, stock: { $gte: newItem.quantity } },
            update: { $inc: { stock: -newItem.quantity } }
          }
        });
      }
    });

    if (stockDiffOps.length > 0) {
      await Product.bulkWrite(stockDiffOps);
    }

    if (voidedDiff.length > 0) {
      if (!transaction.voidedItems) transaction.voidedItems = [];
      transaction.voidedItems.push(...voidedDiff);

      const itemsStr = voidedDiff.map(i => `${i.quantity}x ${i.name}`).join(', ');
      await ActivityLog.create({
        title: 'Pembatalan Item',
        message: `Kasir ${session.user.name || 'Kasir'} mengurangi/membatalkan item: ${itemsStr} di nota ${transaction.invoiceNumber}`,
        type: 'warning',
        targetRole: 'admin'
      });
    }

    transaction.items = newItems;
    transaction.subtotal = body.subtotal;
    transaction.dpAmount = body.dpAmount;
    transaction.guideCommission = body.guideCommission;
    transaction.grandTotal = body.grandTotal;
    
    // Jika ganti meja atau order type
    if (body.tableNumber) transaction.tableNumber = body.tableNumber;
    if (body.orderType) transaction.orderType = body.orderType;

    await transaction.save();

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Update full transaction error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui faktur gantung' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectMongo();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses' }, { status: 401 });
    }

    const resolvedParams = await params;
    const transactionId = resolvedParams.id;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Kembalikan stok semua item sebelum dihapus
    if (transaction.items && transaction.items.length > 0) {
      const bulkOps = transaction.items.map((item: any) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: item.quantity } }
        }
      }));
      await Product.bulkWrite(bulkOps);
    }

    // Set paymentStatus to void instead of deleting
    transaction.paymentStatus = 'void';
    await transaction.save();

    await ActivityLog.create({
      title: 'Batal Transaksi / Void',
      message: `Kasir ${session.user.name || 'Kasir'} membatalkan keseluruhan nota ${transaction.invoiceNumber}`,
      type: 'danger',
      targetRole: 'admin'
    });

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Gagal menghapus transaksi' }, { status: 500 });
  }
}
