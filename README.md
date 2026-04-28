# NutriScan AI - Full-Stack Web Application

NutriScan adalah aplikasi cerdas berbasis web yang menganalisis label informasi nilai gizi (Nutrition Facts) dari foto kemasan makanan, memberikan informasi detail, dan menghitung Nutri-Score secara instan. 

Proyek ini telah direfaktor menjadi arsitektur **Full-Stack (Client-Server)** untuk skalabilitas dan performa yang lebih baik.

## Arsitektur Sistem

Aplikasi ini dipisahkan menjadi dua entitas utama:

1. **Frontend (React + Vite)**: Berperan sebagai User Interface. Bertanggung jawab atas interaksi pengguna (kamera/upload gambar) dan menampilkan hasil secara dinamis.
2. **Backend (Node.js + Express)**: Berperan sebagai API dan AI Engine. Bertanggung jawab memproses gambar (AI Inference dengan YOLOv8 ONNX + Tesseract OCR), mengelola autentikasi (JWT), dan menyimpan riwayat di database (MySQL).

## Cara Menjalankan Aplikasi Secara Lokal

### Prasyarat
- Node.js v18+
- MySQL 8.0+

### 1. Persiapan Database
Buat database dan tabel menggunakan skema yang disediakan.
```bash
mysql -u root -p < database/schema.sql
```
*(Atau jalankan `npm run migrate` di folder `backend` setelah setup `.env`)*

### 2. Setup Backend
Masuk ke folder `backend`, install dependensi, dan sesuaikan file environment.
```bash
cd backend
npm install
cp .env.example .env  # (Buat file .env dan isi kredensial MySQL Anda)
npm run dev
```
*Backend akan berjalan di `http://localhost:5001`*

### 3. Setup Frontend
Buka terminal baru, masuk ke folder `frontend`, install dependensi, dan jalankan dev server.
```bash
cd frontend
npm install
npm run dev
```

-----

## 🧠 Model Pipeline (YOLOv8 OBB)

Proyek ini menggunakan pipeline pemrosesan data sebagai berikut:

1.  **Input Citra:** Pengguna mengunggah atau mengambil foto kemasan makanan.
2.  **Preprocessing:** Resize ke 640x640 & Normalisasi piksel (0-1).
3.  **Inference (YOLOv8 OBB):** Model mendeteksi lokasi teks nutrisi (Gula, Garam, Kalori, dll).
4.  **Cropping & Upscaling:** Bagian gambar yang terdeteksi dipotong dan diperbesar (5x upscale) untuk meningkatkan akurasi baca.
5.  **OCR (Tesseract):** Membaca teks dari potongan gambar.
6.  **Data Cleaning:** Regex filter untuk mengambil angka saja.
7.  **Scoring:** Menghitung skor akhir (A - E).

### Label/Kelas Model

Pastikan model Anda dilatih dengan urutan kelas (classes) berikut agar sesuai dengan logika kode:

| ID | Label | Deskripsi |
| :--- | :--- | :--- |
| 0 | `kalori` | Energi Total (kkal) |
| 1 | `lemak` | Lemak Jenuh/Total |
| 2 | `nutrition-fact` | Header Tabel (Diabaikan) |
| 3 | `serving` | Jumlah Sajian per Kemasan |
| 4 | `takaran-satuan` | Berat per sajian (gram/ml) |
| 5 | `gula` | Total Gula |
| 6 | `garam` | Natrium/Garam |
| 7 | `protein` | Protein |
| 8 | `serat` | Serat Pangan |

*(Sesuaikan tabel di atas dengan `classes.txt` hasil training Anda)*

-----

## ⚙️ Cara Konversi Model (Python ke TFJS)

Jika Anda melatih model menggunakan Python (Ultralytics), Anda perlu mengonversinya agar bisa jalan di web:

```bash
# Install library yang dibutuhkan
pip install ultralytics tensorflowjs

# Jalankan perintah export
yolo export model=path/to/best.pt format=tfjs imgsz=640
```

Folder hasil export (`best_web_model`) harus dipindahkan ke folder `public/` di proyek React ini.

-----

## 📂 Struktur Folder

```
src/
├── components/
│   ├── ModelRunner.jsx    # Core Logic (Inference + OCR Loop)
│   └── ...
├── utils/
│   ├── clean.js           # Regex & Data Cleaning Logic
│   └── nutriscore.js      # Algoritma Perhitungan Nutri-Score
├── App.jsx
└── main.jsx
public/
└── my_model/              # File Model TFJS disimpan di sini
```

-----

## 🤝 Kontribusi

Kontribusi sangat diterima\! Silakan fork repository ini dan buat Pull Request untuk fitur baru atau perbaikan bug.

1.  Fork Project
2.  Create Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to Branch (`git push origin feature/AmazingFeature`)
5.  Open Pull Request

-----
