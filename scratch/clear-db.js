const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB');

    const db = mongoose.connection.db;

    // Menghapus koleksi
    await db.collection('products').deleteMany({});
    console.log('✅ Products dibersihkan');

    await db.collection('categories').deleteMany({});
    console.log('✅ Categories dibersihkan');

    await db.collection('transactions').deleteMany({});
    console.log('✅ Transactions dibersihkan');

    console.log('🎉 Semua data menu, kategori, dan transaksi berhasil dihapus!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal membersihkan database:', error);
    process.exit(1);
  }
}

clearDB();
