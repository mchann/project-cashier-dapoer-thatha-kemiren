// src/app/api/pos/transactions/sync/route.ts
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

export async function POST(req: Request) {
  try {
    await connectMongo();

    // 1. Verifikasi Keamanan Autentikasi Kasir
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Akses ditolak: Kasir wajib login untuk melakukan sinkronisasi data' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { transactions } = body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: 'Daftar transaksi offline kosong atau format tidak valid' },
        { status: 400 }
      );
    }

    const syncResults: Array<{
      clientTxId: string;
      invoiceNumber: string;
      status: 'synced' | 'failed';
      error?: string;
    }> = [];

    const cashierId = new mongoose.Types.ObjectId(session.user.id);
    const cashierName = session.user.name || session.user.username || 'Kasir';

    // 2. Proses Setiap Transaksi dengan Idempotensi & Validasi
    for (const tx of transactions) {
      const {
        clientTxId,
        invoiceNumber,
        tableNumber,
        customerName,
        orderType,
        paymentStatus,
        paymentMethod,
        items,
        subtotal,
        dpAmount = 0,
        discountAmount = 0,
        guideCommission = 0,
        guideCode = '',
        guideName = '',
        isGuideOrder = false,
        isGuideRewardProcessed = false,
        grandTotal,
        amountReceived,
        changeAmount,
        offlineCreatedAt
      } = tx;

      if (!clientTxId || !invoiceNumber) {
        syncResults.push({
          clientTxId: clientTxId || 'unknown',
          invoiceNumber: invoiceNumber || 'unknown',
          status: 'failed',
          error: 'Identitas transaksi (clientTxId / invoiceNumber) tidak lengkap'
        });
        continue;
      }

      try {
        // Cek IDEMPOTENSI: Apakah sudah pernah disinkronkan sebelumnya?
        const existingTx = await Transaction.findOne({
          $or: [{ clientTxId }, { invoiceNumber }]
        });

        if (existingTx) {
          // Sudah tersimpan sebelumnya, tandai sukses tanpa duplikasi
          syncResults.push({
            clientTxId,
            invoiceNumber,
            status: 'synced'
          });
          continue;
        }

        // Validasi Item
        if (!items || !Array.isArray(items) || items.length === 0) {
          syncResults.push({
            clientTxId,
            invoiceNumber,
            status: 'failed',
            error: 'Keranjang transaksi offline kosong'
          });
          continue;
        }

        // Verifikasi integritas angka (Math Check)
        const calculatedSubtotal = items.reduce(
          (sum: number, it: any) => sum + (Number(it.price) * Number(it.quantity)),
          0
        );
        const calculatedGrandTotal = Math.max(0, calculatedSubtotal - Number(dpAmount) - Number(discountAmount));

        // Pengurangan Stok Bahan Baku
        // Note: Pada transaksi offline, makanan sudah dimasak & disajikan ke pelanggan.
        // Jadi kita kurangi stok bahan baku. Jika stok minus, kurangi dan catat peringatan agar akuntansi tetap akurat.
        const productIds = items.map((i: any) => i.productId).filter(Boolean);
        if (productIds.length > 0) {
          const productsInDb = await Product.find({ _id: { $in: productIds } }).populate('rawMaterialId');
          const rawMaterialDeductions: Record<string, number> = {};

          for (const item of items) {
            const dbProduct = productsInDb.find(p => p._id.toString() === item.productId?.toString());
            if (dbProduct && !dbProduct.isUnlimited && dbProduct.rawMaterialId) {
              const rmId = (dbProduct.rawMaterialId as any)._id?.toString() || dbProduct.rawMaterialId.toString();
              rawMaterialDeductions[rmId] = (rawMaterialDeductions[rmId] || 0) + Number(item.quantity);
            }
          }

          const rmIds = Object.keys(rawMaterialDeductions);
          if (rmIds.length > 0) {
            const bulkOps = rmIds.map(rmId => ({
              updateOne: {
                filter: { _id: rmId },
                update: { $inc: { stock: -rawMaterialDeductions[rmId] } }
              }
            }));
            await RawMaterial.bulkWrite(bulkOps).catch(err =>
              console.error('Peringatan: Gagal memotong stok bahan baku untuk transaksi offline:', err)
            );
          }
        }

        // Simpan ke Koleksi Transaksi
        const newTransaction = await Transaction.create({
          invoiceNumber,
          clientTxId,
          isOfflineSync: true,
          offlineCreatedAt: offlineCreatedAt ? new Date(offlineCreatedAt) : new Date(),
          offlineSyncedAt: new Date(),
          tableNumber: tableNumber || '',
          customerName: customerName || 'Pelanggan',
          orderType: orderType || 'dine_in',
          paymentStatus: paymentStatus || 'paid',
          paymentMethod: paymentMethod || 'tunai',
          items,
          subtotal: calculatedSubtotal || subtotal,
          dpAmount: dpAmount || 0,
          discountAmount: discountAmount || 0,
          guideCommission: guideCommission || 0,
          guideCode: guideCode || '',
          guideName: guideName || '',
          isGuideOrder: isGuideOrder || false,
          isGuideRewardProcessed: isGuideRewardProcessed || false,
          grandTotal: calculatedGrandTotal || grandTotal,
          amountReceived: amountReceived || calculatedGrandTotal || grandTotal,
          changeAmount: changeAmount || 0,
          cashierName,
          cashierId
        });

        // Update Guide Voucher jika ada
        if (guideCode) {
          await GuideVoucher.findOneAndUpdate(
            { code: guideCode },
            { 
              status: 'used', 
              usedAt: new Date(), 
              transactionId: newTransaction._id 
            }
          ).catch(() => {});
        }

        // Catat Pengeluaran jika ada komisi cashback guide
        if (paymentStatus === 'paid' && guideCommission > 0) {
          await Expense.create({
            title: `Pencairan Cashback Guide (Offline): ${guideName || 'Guide'}`,
            amount: guideCommission,
            category: 'operasional',
            notes: `Transaksi Offline: ${invoiceNumber} (Voucher: ${guideCode})`,
            date: new Date()
          }).catch(() => {});
        }

        syncResults.push({
          clientTxId,
          invoiceNumber,
          status: 'synced'
        });

      } catch (err: any) {
        console.error(`Gagal sinkron transaksi ${invoiceNumber}:`, err);
        syncResults.push({
          clientTxId,
          invoiceNumber,
          status: 'failed',
          error: err.message || 'Gagal menyimpan transaksi ke database cloud'
        });
      }
    }

    // 3. Catat Aktivitas Sinkronisasi ke ActivityLog
    const successfulCount = syncResults.filter(r => r.status === 'synced').length;
    if (successfulCount > 0) {
      await ActivityLog.create({
        title: 'Sinkronisasi Transaksi Offline Selesai',
        message: `Kasir ${cashierName} berhasil menyinkronkan ${successfulCount} dari ${transactions.length} transaksi offline ke cloud database.`,
        type: 'info',
        targetRole: 'admin'
      }).catch(() => {});
    }

    return NextResponse.json({
      message: `Proses sinkronisasi selesai: ${successfulCount} transaksi berhasil disinkronkan.`,
      results: syncResults
    });

  } catch (error: any) {
    console.error('Sinkronisasi Offline Error:', error);
    return NextResponse.json(
      { error: 'Gagal memproses sinkronisasi: ' + error.message },
      { status: 500 }
    );
  }
}
