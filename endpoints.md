# DOKUMENTASI API / ENDPOINTS (REST API)
**Base URL:** `/api`
**Format Data:** `application/json`

---

## 1. AUTHENTICATION & USER MANAGEMENT
Di-handle menggunakan NextAuth, tapi kita butuh API tambahan untuk manajemen staf dan verifikasi keamanan.

### `GET /api/users`
- **Fungsi:** Mengambil daftar semua staf/pegawai (Hanya untuk Superadmin).
- **Response:** `[ { _id, name, email, role, isActive } ]`

### `POST /api/users`
- **Fungsi:** Membuat akun staf baru (Hanya untuk Superadmin).
- **Payload:** `{ name, email, password, role }`

### `POST /api/auth/verify-void`
- **Fungsi:** Memverifikasi PIN Void dari Superadmin sebelum membatalkan pesanan di Kasir.
- **Payload:** `{ voidPin }`
- **Response:** `{ success: true, message: "PIN Valid" }` atau status `401 Unauthorized`.

---

## 2. MASTER DATA: CATEGORY & PRODUCT
Digunakan di Halaman Admin (CRUD Menu) dan Halaman Publik (Tampilan Menu).

### `GET /api/categories`
- **Fungsi:** Mengambil daftar kategori menu.
- **Response:** `[ { _id, name, slug } ]`

### `GET /api/products`
- **Fungsi:** Mengambil daftar menu. Bisa difilter berdasarkan kategori atau status ketersediaan.
- **Query Params:** `?category=[id]` (opsional), `?isAvailable=true` (opsional)
- **Response:** `[ { _id, name, price, stock, image, category: { _id, name } } ]`

### `POST /api/products`
- **Fungsi:** Menambah menu baru (Hanya Admin).
- **Payload:** `{ name, description, price, stock, image, categoryId }`

### `PUT /api/products/:id`
- **Fungsi:** Mengedit data menu atau *update* stok manual (Hanya Admin).

---

## 3. MASTER DATA: PARTNER (MITRA/GUIDE) & EXPENSE (PENGELUARAN)

### `GET /api/partners`
- **Fungsi:** Mengambil daftar agen travel/guide untuk *dropdown* di kasir.
- **Response:** `[ { _id, name, isActive } ]`

### `POST /api/expenses`
- **Fungsi:** Mencatat pengeluaran dapur/belanja bahan mentah (Hanya Admin).
- **Payload:** `{ description, amount, recordedBy }`

### `GET /api/expenses`
- **Fungsi:** Mengambil riwayat pengeluaran harian/bulanan.
- **Query Params:** `?date=YYYY-MM-DD`

---

## 4. TRANSACTION & ORDER (MODUL KASIR UTAMA)
Ini adalah urat nadi aplikasi. API ini menangani alur pemesanan langsung, QR, dan Reservasi.

### `GET /api/orders`
- **Fungsi:** Mengambil daftar pesanan/faktur. Digunakan untuk menampilkan antrean **Faktur Gantung** di layar kasir.
- **Query Params:** 
  - `?paymentStatus=unpaid,dp_paid` (Untuk tab Faktur Gantung)
  - `?paymentStatus=paid` (Untuk riwayat lunas)
- **Response:** `[ { _id, invoiceNumber, tableNumber, items, grandTotal, paymentStatus, ... } ]`

### `POST /api/orders`
- **Fungsi:** Membuat pesanan baru (Dari Kasir, QR, atau input Reservasi).
- **Catatan Penting (Smart Merge):** Di *backend*, API ini harus mengecek apakah `tableNumber` yang dikirim sudah memiliki pesanan dengan status `unpaid` atau belum. Jika sudah ada, jangan buat dokumen baru, melainkan *push* `items` baru ke dokumen yang sudah ada.
- **Payload (QR/Kasir):** 
  ```json
  { 
    "tableNumber": "5", 
    "items": [ { "productId": "xxx", "quantity": 2 } ],
    "orderType": "dine_in"
  }

### Payload (Reservasi oleh Admin): Tambahkan dpAmount, customerName, paymentStatus: "dp_paid".

### `PUT /api/orders/:id/pay`
- **Fungsi:** Memproses pelunasan pesanan di Kasir (mengubah faktur gantung menjadi lunas).
- **Payload:** `{ paymentMethod: "cash", guideCommission: 50000, partnerId: "xxx" (opsional) }`

### Proses di Backend:

### Ubah paymentStatus menjadi paid.

### Hitung grandTotal (Subtotal - DP - guideCommission).

### Simpan servedBy (ID Kasir).

### Kurangi stok Product di database berdasarkan items yang dipesan.

### `PUT /api/orders/:id/void`
- **Fungsi:** Membatalkan pesanan (Void). Harus memanggil /api/auth/verify-void dulu di frontend.
- **Payload:** `{ voidReason, voidedBy (ID Kasir) }`

### Proses di Backend:

### Ubah isVoided menjadi true.

### Kembalikan (increment) stok Product berdasarkan jumlah barang di pesanan ini.

### Keluarkan nominal dari laporan penjualan.

### 5. REPORTING (LAPORAN KEUANGAN)
### `GET /api/reports/daily`
- **Fungsi:** Mengambil ringkasan laba bersih hari ini (Hanya Admin).
- **Query Params:** `?date=YYYY-MM-DD`
- **Response:**
```json
{
  "totalGrossRevenue": 5000000,
  "totalGuideCommissions": 200000,
  "totalExpenses": 1500000,
  "netProfit": 3300000,
  "totalOrders": 45
}