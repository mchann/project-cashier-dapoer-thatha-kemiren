import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { Product } from '@/models/Product';
import { GuideVoucher } from '@/models/GuideVoucher';
import ActivityLog from '@/models/ActivityLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectMongo();
    
    // Ambil session kasir
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses (Unauthorized)' }, { status: 401 });
    }

    // Mengambil semua transaksi lunas, diurutkan dari terbaru
    const transactions = await Transaction.find({ paymentStatus: { $in: ['paid', 'void'] } }).sort({ createdAt: -1 });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectMongo();
    
    // Ambil session kasir yang sedang login
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses (Unauthorized)' }, { status: 401 });
    }

    const body = await req.json();
    const {
      invoiceNumber,
      tableNumber,
      customerName,
      orderType,
      paymentStatus,
      items,
      subtotal,
      dpAmount,
      discountAmount,
      guideCommission,
      guideCode,
      guideName,
      grandTotal,
      amountReceived,
      changeAmount,
      paymentMethod
    } = body;

    // Validasi input dasar
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 });
    }
    if (amountReceived < grandTotal && paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Uang yang diterima kurang' }, { status: 400 });
    }

    // --- LOGIKA PENGURANGAN STOK DENGAN VALIDASI ---
    // Karena kita tidak memakai session database MongoDb (perlu replica set),
    // kita cek manual ketersediaan stok lalu kita potong menggunakan bulkWrite.

    // 1. Ambil semua ID produk yang dibeli
    const productIds = items.map((item: any) => item.productId);
    const productsInDb = await Product.find({ _id: { $in: productIds } });

    // 2. Cek apakah ada menu yang tidak ditemukan atau stoknya kurang
    for (const item of items) {
      const dbProduct = productsInDb.find((p) => p._id.toString() === item.productId.toString());
      
      if (!dbProduct) {
        return NextResponse.json({ error: `Menu ${item.name} tidak ditemukan di database` }, { status: 404 });
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stok tidak cukup untuk ${item.name}. Sisa: ${dbProduct.stock}, Diminta: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // 3. Buat operasi BulkWrite untuk mengurangi stok
    const bulkOps = items.map((item: any) => ({
      updateOne: {
        filter: { _id: item.productId, stock: { $gte: item.quantity } }, // Pastikan tidak tembus 0 (race condition guard)
        update: { $inc: { stock: -item.quantity } }
      }
    }));

    // Cek stok habis untuk dilog
    const stockLogs: any[] = [];
    for (const item of items) {
      const dbProduct = productsInDb.find((p) => p._id.toString() === item.productId.toString());
      if (dbProduct && (dbProduct.stock - item.quantity <= 0)) {
        stockLogs.push({
          title: 'Stok Habis / Menipis',
          message: `Stok menu ${item.name} habis setelah pesanan ini!`,
          type: 'warning',
          targetRole: 'admin'
        });
      }
    }

    const bulkResult = await Product.bulkWrite(bulkOps);

    // Jika jumlah yang berhasil diupdate kurang dari jumlah jenis item, 
    // berarti ada race condition di mana stok habis di tengah-tengah oleh kasir lain.
    if (bulkResult.modifiedCount < items.length) {
      return NextResponse.json(
        { error: 'Terjadi konflik stok (mungkin baru saja dibeli kasir lain). Silakan ulangi transaksi.' },
        { status: 409 }
      );
    }

    // 4. Jika potong stok berhasil, simpan Transaksi
    const newTransaction = await Transaction.create({
      invoiceNumber,
      tableNumber: tableNumber || '',
      customerName,
      orderType,
      paymentStatus: paymentStatus || 'paid',
      items,
      subtotal,
      dpAmount: dpAmount || 0,
      discountAmount: discountAmount || 0,
      guideCommission: guideCommission || 0,
      guideCode: guideCode || '',
      guideName: guideName || '',
      grandTotal,
      amountReceived,
      changeAmount,
      paymentMethod,
      cashierName: session.user.name || session.user.username || 'Kasir',
      cashierId: new mongoose.Types.ObjectId(session.user.id),
    });

    // 5. Update Status Voucher jika menggunakan GuideCode
    if (guideCode) {
      await GuideVoucher.findOneAndUpdate(
        { code: guideCode },
        { 
          status: 'used', 
          usedAt: new Date(), 
          transactionId: newTransaction._id 
        }
      );
    }

    // 5. Catat ke ActivityLog
    const logsToCreate = [...stockLogs];
    
    // Log Transaksi
    if (paymentStatus === 'paid') {
      logsToCreate.push({
        title: 'Pesanan Lunas',
        message: `Kasir ${session.user.name || 'Kasir'} menyelesaikan pesanan ${invoiceNumber} sejumlah Rp ${grandTotal.toLocaleString('id-ID')}`,
        type: 'success',
        targetRole: 'admin'
      });
    }

    // Log Komisi Guide
    if (guideCommission > 0) {
      logsToCreate.push({
        title: 'Komisi Guide',
        message: `Kasir ${session.user.name || 'Kasir'} mencatat Komisi Guide sebesar Rp ${guideCommission.toLocaleString('id-ID')} pada transaksi ${invoiceNumber}`,
        type: 'info',
        targetRole: 'admin'
      });
    }

    if (logsToCreate.length > 0) {
      await ActivityLog.insertMany(logsToCreate);
    }

    return NextResponse.json(newTransaction, { status: 201 });

  } catch (error: any) {
    console.error('Transaction Error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses transaksi' },
      { status: 500 }
    );
  }
}
