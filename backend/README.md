# NutriScan - Backend API & AI Engine

Ini adalah sisi server (Backend) untuk aplikasi NutriScan, dibangun menggunakan **Node.js** dan **Express**. Backend ini menangani autentikasi, pipeline AI/OCR yang berat, dan penyimpanan data.

## Stack Teknologi
- **Framework**: Express.js
- **Database**: MySQL 8.0 (ORM menggunakan Knex.js)
- **Authentication**: JWT (JSON Web Token) & bcryptjs
- **File Upload**: Multer
- **Image Processing**: Sharp (Resize, Grayscale, Contrast adjustment)
- **AI Inference**: ONNX Runtime Node (`onnxruntime-node`) untuk menjalankan model YOLOv8.
- **OCR**: Tesseract.js untuk pengenalan karakter.

## Arsitektur Pipeline Scan

1. Frontend mengunggah foto kemasan (`/api/scan`).
2. **Pre-processing**: Gambar di-*letterbox* dan diubah menjadi Float32 tensor menggunakan `sharp`.
3. **Inference**: Model ONNX mendeteksi lokasi elemen (Kalori, Gula, Garam, dll).
4. **Cropping & OCR**: Setiap area yang terdeteksi di-crop, di-*upscale*, dan diproses oleh Tesseract.
5. **Data Cleaning**: Teks mentah dibersihkan dan diubah menjadi angka.
6. **Scoring**: Skor gizi (Nutri-Score) dihitung berdasarkan kandungan.
7. **Storage**: Data historis dan path gambar disimpan ke MySQL, sementara gambar disimpan di folder `uploads/`.

## Environment Variables (.env)
Anda harus membuat file `.env` di folder ini sebelum menjalankan server:

```env
PORT=5001
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_anda
DB_NAME=nutriscan_db

# Security
JWT_SECRET=rahasia_jwt_sangat_kuat_2024
JWT_EXPIRES_IN=7d

# File Upload Limit
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

## Cara Menjalankan

```bash
# Instalasi dependensi
npm install

# membuat database jika belum tersedia atau lupa (sesuaikan dengan user dan password mysql anda)
mysql -u root -e "CREATE DATABASE IF NOT EXISTS nutriscan_db;"

# Menjalankan Database Migrations (Opsional jika Anda sudah import schema.sql secara manual)
npm run migrate

# Menjalankan development server (dengan watcher)
npm run dev
```

Server akan mengekspos endpoint API di `http://localhost:5001/api`.
