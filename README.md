# API Backend CRUD Order

API backend berbasis Node.js Express dan MongoDB untuk mengelola order dan produk order.

## Fitur

- API CRUD RESTful untuk Order dan Produk Order
- Pembuatan nomor order otomatis (format: INV + YYYYMMDD + nomor urut)
- Pencarian order berdasarkan nomor order
- Penyaringan order berdasarkan rentang tanggal
- Fungsi ekspor Excel dengan penanganan yang dioptimalkan untuk dataset besar
- Script pengisian data untuk menghasilkan 5000+ test orders

## Prasyarat

- Node.js (v14 atau lebih tinggi)
- MongoDB (lokal atau Atlas)
- npm atau yarn

## Memulai

### Instalasi

1. Clone repositori

```bash
git clone https://github.com/elvan/order-crud-backend-nodejs-express.git
cd order-crud-backend-nodejs-express
```

2. Install dependencies

```bash
npm install
```

3. Konfigurasi environment variables

Buat file `.env` di direktori root dan tambahkan berikut ini:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/order-crud
```

Sesuaikan `MONGO_URI` sesuai kebutuhan untuk pengaturan MongoDB Anda.

### Menjalankan Aplikasi

#### Mode Pengembangan

```bash
npm run dev
```

Ini akan memulai server dengan nodemon untuk restart otomatis saat kode berubah.

#### Mode Produksi

```bash
npm start
```

### Pengisian Data

Untuk menghasilkan data uji (5000+ order dengan produk):

```bash
npm run seed
```

## Endpoint API

### Order

- `GET /api/orders` - Mendapatkan semua order (dengan pagination)
- `GET /api/orders/:id` - Mendapatkan satu order dengan produknya
- `POST /api/orders` - Membuat order baru dengan produk
- `PUT /api/orders/:id` - Memperbarui order yang ada dan produknya
- `DELETE /api/orders/:id` - Menghapus order dan produk terkait

### Pencarian & Filter

- `GET /api/orders/search?order_no=<value>` - Mencari order berdasarkan nomor order
- `GET /api/orders/filter?start_date=<yyyy-mm-dd>&end_date=<yyyy-mm-dd>` - Memfilter order berdasarkan rentang tanggal

### Ekspor

- `GET /api/orders/export/excel` - Mengekspor order ke Excel
  - Opsional: `?start_date=<yyyy-mm-dd>&end_date=<yyyy-mm-dd>` - Memfilter ekspor berdasarkan rentang tanggal

## Struktur Proyek

```
├── src/
│   ├── config/        # File konfigurasi
│   ├── controllers/   # Pengontrol rute
│   ├── middleware/    # Middleware kustom
│   ├── models/        # Model database
│   ├── routes/        # Rute API
│   ├── scripts/       # Skrip untuk pengisian data, dll.
│   ├── utils/         # Fungsi utilitas
│   └── index.js       # Titik masuk aplikasi
├── .env               # Variabel lingkungan
├── .gitignore
├── package.json
└── README.md
```

## Contoh Request & Response

### Membuat Order

**Request:**

```json
POST /api/orders
Content-Type: application/json

{
  "customer_name": "John Doe",
  "order_date": "2023-04-24",
  "products": [
    {
      "product_name": "Laptop",
      "qty": 2,
      "price": 1200
    },
    {
      "product_name": "Mouse",
      "qty": 1,
      "price": 50
    }
  ]
}
```

**Response:**

```json
{
  "_id": "5f5f5f5f5f5f5f5f5f5f5f5f",
  "order_no": "INV202304240001",
  "customer_name": "John Doe",
  "order_date": "2023-04-24T00:00:00.000Z",
  "grand_total": 2450,
  "products": [
    {
      "_id": "5f5f5f5f5f5f5f5f5f5f5f5f",
      "order_id": "5f5f5f5f5f5f5f5f5f5f5f5f",
      "product_name": "Laptop",
      "qty": 2,
      "price": 1200,
      "subtotal": 2400
    },
    {
      "_id": "5f5f5f5f5f5f5f5f5f5f5f5f",
      "order_id": "5f5f5f5f5f5f5f5f5f5f5f5f",
      "product_name": "Mouse",
      "qty": 1,
      "price": 50,
      "subtotal": 50
    }
  ]
}
```
