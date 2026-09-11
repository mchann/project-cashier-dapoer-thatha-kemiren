import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import { Product } from '@/models/Product';
import { RawMaterial } from '@/models/RawMaterial';
import { GuideVoucher } from '@/models/GuideVoucher';
import ActivityLog from '@/models/ActivityLog';
import { Expense } from '@/models/Expense';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectMongo();
    
    // Ambil session kasir
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Tidak ada akses (Unauthorized)' }, { status: 401 });
    }

    // Mengambil semua transaksi lunas, diurutkan dari terbaru
    const query: any = { paymentStatus: { $in: ['paid', 'void'] } };
    
    // Check if filtering by pending guide rewards
    const { searchParams } = new URL(req.url || '', 'http://localhost');
    if (searchParams.get('guidePending') === 'true') {
      query.isGuideOrder = true;
      query.isGuideRewardProcessed = false;
      query.paymentStatus = 'paid';
    }

    // Jika bukan superadmin, hanya tampilkan transaksi miliknya sendiri
    if (session.user.role !== 'superadmin') {
      query.cashierId = session.user.id;
    }

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    
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
      isGuideOrder,
      isGuideRewardProcessed,
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

    // --- LOGIKA PENGURANGAN STOK BAHAN BAKU ---
    // 1. Ambil semua ID produk yang dibeli
    const productIds = items.map((item: any) => item.productId);
    const productsInDb = await Product.find({ _id: { $in: productIds } }).populate('rawMaterialId');

    // 2. Kumpulkan rawMaterialId yang terpengaruh dan hitung total permintaan per bahan baku
    const rawMaterialRequests: Record<string, number> = {};
    const itemNamesMap: Record<string, string[]> = {}; // Untuk logging jika habis

    for (const item of items) {
      const dbProduct = productsInDb.find((p) => p._id.toString() === item.productId.toString());
      
      if (!dbProduct) {
        return NextResponse.json({ error: `Menu ${item.name} tidak ditemukan di database` }, { status: 404 });
      }

      // Jika menu unlimited, tidak perlu potong stok
      if (dbProduct.isUnlimited) continue;

      // Jika tidak unlimited tapi tidak punya bahan baku
      if (!dbProduct.rawMaterialId) {
        return NextResponse.json({ error: `Menu ${item.name} tidak diset sebagai unlimited tetapi tidak memiliki bahan baku yang tertaut.` }, { status: 400 });
      }

      const rmId = (dbProduct.rawMaterialId as any)._id.toString();
      if (!rawMaterialRequests[rmId]) {
        rawMaterialRequests[rmId] = 0;
        itemNamesMap[rmId] = [];
      }
      rawMaterialRequests[rmId] += item.quantity;
      if (!itemNamesMap[rmId].includes(dbProduct.name)) {
        itemNamesMap[rmId].push(dbProduct.name);
      }
    }

    // 3. Cek apakah stok bahan baku cukup
    const rmIdsToUpdate = Object.keys(rawMaterialRequests);
    const stockLogs: any[] = [];
    let rawMaterialsInDb: any[] = [];
    
    if (rmIdsToUpdate.length > 0) {
      rawMaterialsInDb = await RawMaterial.find({ _id: { $in: rmIdsToUpdate } });

      for (const rmId of rmIdsToUpdate) {
        const rm = rawMaterialsInDb.find(r => r._id.toString() === rmId);
        if (!rm) {
          return NextResponse.json({ error: `Bahan baku dengan ID ${rmId} tidak ditemukan.` }, { status: 404 });
        }
        if (rm.stock < rawMaterialRequests[rmId]) {
          return NextResponse.json(
            { error: `Stok bahan baku "${rm.name}" tidak cukup untuk menu (${itemNamesMap[rmId].join(', ')}). Sisa: ${rm.stock} ${rm.unit}, Diminta: ${rawMaterialRequests[rmId]} ${rm.unit}` },
            { status: 400 }
          );
        }
      }

      // 4. Buat operasi BulkWrite untuk mengurangi stok bahan baku
      const bulkOps = rmIdsToUpdate.map(rmId => ({
        updateOne: {
          filter: { _id: rmId, stock: { $gte: rawMaterialRequests[rmId] } }, // Race condition guard
          update: { $inc: { stock: -rawMaterialRequests[rmId] } }
        }
      }));

      // Cek stok habis untuk dilog
      for (const rmId of rmIdsToUpdate) {
        const rm = rawMaterialsInDb.find(r => r._id.toString() === rmId);
        if (rm && (rm.stock - rawMaterialRequests[rmId] <= 0)) {
          stockLogs.push({
            title: 'Bahan Baku Habis',
            message: `Stok bahan baku "${rm.name}" habis setelah transaksi ini!`,
            type: 'warning',
            targetRole: 'admin'
          });
        }
      }

      const bulkResult = await RawMaterial.bulkWrite(bulkOps);

      if (bulkResult.modifiedCount < rmIdsToUpdate.length) {
        return NextResponse.json(
          { error: 'Terjadi konflik stok (mungkin baru saja dibeli kasir lain). Silakan ulangi transaksi.' },
          { status: 409 }
        );
      }

      // Simpan log secara asinkron
      if (stockLogs.length > 0) {
        ActivityLog.insertMany(stockLogs).catch(err => console.error('Failed to save stock logs:', err));
      }
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
      isGuideOrder: isGuideOrder || false,
      isGuideRewardProcessed: isGuideRewardProcessed || false,
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

    // 6. Jika ada Cashback (guideCommission) dan status paid, catat ke Pengeluaran (Expense)
    if (paymentStatus === 'paid' && guideCommission > 0) {
      await Expense.create({
        title: `Pencairan Cashback Guide: ${guideName || 'Guide'}`,
        amount: guideCommission,
        category: 'operasional',
        notes: `Transaksi: ${invoiceNumber} (Voucher: ${guideCode})`,
        date: new Date()
      });
    }

    // 7. Catat ke ActivityLog
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
      { error: error.message || 'Gagal memproses transaksi' },
      { status: 500 }
    );
  }
}
