# NutriScan - Aplikasi Pemindai Nutrisi dengan AI

![NutriScore](https://img.shields.io/badge/Nutri--Score-A--E-green)
![React](https://img.shields.io/badge/React-18-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)
![TFJS](https://img.shields.io/badge/TensorFlow.js-4-orange)

Aplikasi web untuk memindai label nutrisi makanan dan menghitung Nutri-Score secara otomatis menggunakan AI (TensorFlow.js + Tesseract.js).

## ✨ Fitur

- 📷 **Capture dari Kamera** - Ambil foto langsung dari webcam/kamera device
- 📁 **Upload Gambar** - Upload foto dari galeri atau file
- 🤖 **AI Detection** - Deteksi label nutrisi otomatis dengan YOLO (TFJS)
- 📝 **OCR** - Baca teks dari gambar dengan Tesseract.js
- 🏆 **Nutri-Score** - Hitung skor nutrisi (A-E) secara otomatis
- 📊 **History** - Simpan dan lihat riwayat scan (in-memory)
- 🎨 **Modern UI** - Desain dashboard modern dengan TailwindCSS

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Letakkan Model TFJS

Letakkan file model TensorFlow.js Anda di folder `public/my_model/`:

```
public/
└── my_model/
    ├── model.json          <- File utama (WAJIB)
    ├── group1-shard1of4.bin
    ├── group1-shard2of4.bin
    └── ...
```

Lihat `public/my_model/README.txt` untuk detail lebih lanjut.

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📁 Struktur Project

```
SadarGiziWeb/
├── public/
│   └── my_model/           # Folder untuk model TFJS
├── src/
│   ├── components/
│   │   ├── CameraCapture.jsx    # Komponen kamera
│   │   ├── ImageUpload.jsx      # Komponen upload
│   │   ├── ModelRunner.jsx      # Pipeline AI (TFJS + OCR)
│   │   └── NutriScoreDisplay.jsx # Display hasil
│   ├── context/
│   │   └── HistoryContext.jsx   # State management history
│   ├── pages/
│   │   ├── Home.jsx             # Halaman utama (scan)
│   │   └── History.jsx          # Halaman riwayat
│   ├── utils/
│   │   ├── clean.js             # Data cleaning functions
│   │   └── nutriscore.js        # NutriScore calculation
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── tailwind.config.cjs
├── postcss.config.cjs
└── vite.config.js
```

## 🔧 Teknologi

- **React 18** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **TensorFlow.js** - AI/ML inference
- **Tesseract.js** - OCR (Optical Character Recognition)
- **React Router** - Routing
- **UUID** - Unique ID generation

## 📊 Nutri-Score Calculation

Nutri-Score dihitung berdasarkan:

**Poin Negatif (A_score):**
- Energi (kalori)
- Gula
- Lemak jenuh
- Garam/Natrium

**Poin Positif (C_score):**
- Serat
- Protein

**Final Score = A_score - C_score**

| Score | Grade | Warna |
|-------|-------|-------|
| ≤ -1 | A | Hijau Tua |
| 0-2 | B | Hijau Muda |
| 3-10 | C | Kuning |
| 11-18 | D | Oren |
| ≥ 19 | E | Merah |

## ⚠️ Catatan Penting

1. **Penyimpanan History**: Data disimpan secara in-memory (akan hilang setelah refresh). Untuk penyimpanan permanen, dapat diintegrasikan dengan localStorage atau database.

2. **Model AI**: Pastikan model TFJS Anda sudah dikonversi dan diletakkan di `public/my_model/`. Input size model harus 640x640.

3. **Browser Support**: Memerlukan browser modern dengan dukungan WebRTC (untuk kamera) dan WebWorkers (untuk OCR).

4. **HTTPS**: Akses kamera memerlukan HTTPS pada production (localhost tidak memerlukan HTTPS).

## 📝 License

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan.

---

Dibuat dengan ❤️ untuk proyek NutriScan
