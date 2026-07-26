# PRODUCT REQUIREMENTS DOCUMENT (PRD) & BUSINESS FLOW
**Nama Produk:** Cashier & Ordering System Dapoer Thatha
**Versi:** 1.0.0
**Tanggal Dokumen:** Juli 2026

---

## 1. RINGKASAN EKSEKUTIF (OVERVIEW)
Aplikasi ini adalah sistem Point of Sales (POS) berbasis web yang dirancang khusus untuk operasional restoran Dapoer Thatha. Sistem ini bertujuan untuk memudahkan transaksi kasir, mendukung pemesanan mandiri oleh pelanggan (via QR Meja), manajemen reservasi dengan uang muka (DP), serta sistem bagi hasil (cashback) untuk agen travel/tour guide. Sistem dilengkapi keamanan "PIN Void" untuk otorisasi pembatalan pesanan.

## 2. TARGET PENGGUNA & ROLE AKSES
1. **Superadmin (Owner):** Memiliki kontrol penuh atas master data (menu, harga, stok porsi matang), melihat laporan keuangan bersih, mengatur PIN Void, memonitor faktur gantung, dan mendaftarkan akun staf.
2. **Staff (Kasir):** Mengoperasikan halaman kasir (memasukkan pesanan, menerima pembayaran, mengelola antrean faktur gantung). Tanpa akses mengubah master data atau menghapus pesanan tanpa otorisasi.
3. **Pelanggan (Publik):** Mengakses menu digital melalui scan QR di meja atau link reservasi secara mandiri, tanpa perlu membuat akun atau login.

---

## 3. ALUR BISNIS & SKENARIO OPERASIONAL (BUSINESS FLOW)

### Alur 1: Pelanggan Pesan Langsung di Kasir
1. Pelanggan datang ke kasir, menyebutkan pesanan dan Nomor Meja.
2. Kasir (Staff) menginput pesanan di layar POS.
3. Kasir menanyakan metode pembayaran (Bayar Awal atau Bayar Akhir).
   - **Jika Bayar Awal:** Kasir klik "Bayar Lunas", terima uang, cetak struk. Selesai.
   - **Jika Bayar Akhir:** Kasir klik "Simpan ke Faktur Gantung". Dapur mencetak tiket masakan, pelanggan duduk.
4. Setelah pelanggan selesai makan, kasir membuka tab "Faktur Gantung", memanggil nomor meja, dan memproses pelunasan.

### Alur 2: Pelanggan Pesan Mandiri via Barcode Meja (QR)
1. Pelanggan memindai QR di meja, masuk ke web menu (tanpa login).
2. Pelanggan memilih menu, mengetik Nomor Meja, lalu klik "Pesan".
3. **Logika Sistem (Smart Merge):**
   - Jika meja tersebut tidak memiliki tagihan aktif, sistem membuat Faktur Gantung baru.
   - Jika meja tersebut sudah memiliki Faktur Gantung (contoh: nambah menu di tengah makan), pesanan baru ini digabungkan ke tagihan sebelumnya tanpa membuat struk terpisah.
4. Saat selesai makan, pelanggan menuju kasir. Staff memanggil nomor meja dari tab Faktur Gantung dan memproses pembayaran (status berubah menjadi lunas).

### Alur 3: Reservasi Online dengan DP (Faktur Gantung Khusus)
1. Pelanggan membuka link web reservasi, memilih menu, mengisi nama, tanggal, dan klik "Booking".
2. Web mengarahkan pelanggan ke WhatsApp Admin membawa ringkasan pesanan dan tagihan DP (50%).
3. Setelah pelanggan transfer DP, Admin/Owner membuka web dan menginput pesanan tersebut ke sistem dengan status **"DP Dibayar"**.
4. Uang DP otomatis masuk ke Laporan Pemasukan hari tersebut. Pesanan masuk ke antrean "Faktur Gantung".
5. Pada hari-H kedatangan, Kasir mencari Faktur Gantung atas nama pelanggan, lalu memproses sisa pelunasannya saja.

### Alur 4: Otorisasi Keamanan (Void / Batal Pesanan)
1. Terdapat permintaan pembatalan menu/pesanan (contoh: pelanggan batal pesan, atau makanan komplain).
2. Kasir membuka detail struk meja tersebut dan menekan tombol "Void / Batal".
3. Layar web Kasir otomatis terkunci dan meminta **PIN Void**.
4. Kasir meminta PIN otorisasi dari Owner.
5. Jika PIN benar, transaksi dibatalkan, stok menu kembali bertambah (+1), dan laporan pendapatan hari itu otomatis terkoreksi.

### Alur 5: Transaksi Mitra Agen Travel / Tour Guide
1. Rombongan tamu datang bersama Agen (contoh: Travel Jejak Kembara).
2. Saat pembayaran di kasir, Staff/Owner mencentang opsi "Mitra Travel/Guide" dan memilih nama agen dari dropdown.
3. Muncul kolom "Potongan / Cashback Guide". Nominal komisi diinput (contoh: Rp 50.000).
4. Tamu tetap membayar sesuai harga normal di struk. Namun, Agen langsung diberikan komisi tunai.
5. Di Laporan Pendapatan Owner, sistem mencatat: `Total Pendapatan Kotor - Komisi Guide = Laba Bersih`.

### Alur 6: Manajemen Stok & Pengeluaran Dapur (Khusus Owner)
1. **Stok Jual:** Owner menginput porsi matang siap jual di pagi hari. Stok berkurang otomatis setiap ada pesanan masuk.
2. **Pengeluaran Dapur:** Jika dapur berbelanja bahan mentah (contoh: beli ayam 4kg, beras, dll), Owner/Admin mencatatnya di halaman "Pengeluaran Harian".
3. **Rekap Harian:** Laporan Keuangan menghitung secara otomatis: `Total Penjualan Kasir (Lunas) - Pengeluaran Harian = Saldo Akhir (Laba/Rugi)`.

---

## 4. RENCANA STRUKTUR DATABASE (SCHEMA PLAN)

1. **User (Pegawai):** Menyimpan data staf dan admin (name, email, password, role, voidPin khusus Owner).
2. **Category (Kategori Menu):** Pengelompokan masakan (contoh: Makanan Utama, Minuman Dingin).
3. **Product (Katalog Menu):** Menyimpan daftar menu beserta harga, deskripsi, gambar, dan status stok (porsi matang).
4. **Partner (Mitra Agen):** Master data agen travel untuk relasi pembagian komisi.
5. **Expense (Pengeluaran):** Modul untuk mencatat pengeluaran operasional dapur harian.
6. **Order (Master Faktur):** Menyatukan seluruh alur transaksi. Memiliki properti:
   - Nomor Invoice, Nomor Meja, Nama Pelanggan.
   - Status Pembayaran (`unpaid`, `dp_paid`, `paid`).
   - Kalkulasi Harga (Subtotal, Jumlah DP, Komisi Guide, Grand Total).
   - Sistem Void (Status Batal, Alasan Batal, Staf yang membatalkan).