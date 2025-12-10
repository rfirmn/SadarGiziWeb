Tentu, berikut adalah draf **README.md** yang profesional, lengkap, dan terstruktur untuk proyek web Nutri-Score Anda. README ini dirancang untuk menonjolkan penggunaan teknologi **YOLOv8 OBB (Oriented Bounding Box)** yang merupakan fitur kunci proyek Anda.

Anda bisa menyalin kode di bawah ini dan menyimpannya sebagai `README.md` di root folder proyek Anda.

-----

# 🥗 NutriScan AI - Web Nutrition-Score 

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-OBB-00FFFF?style=for-the-badge&logo=yolo&logoColor=black)
![Tesseract.js](https://img.shields.io/badge/Tesseract.js-OCR-blue?style=for-the-badge)

Aplikasi web cerdas untuk menghitung **Nutri-Score** (A-E) pada produk makanan secara otomatis. Menggunakan kecerdasan buatan berbasis **YOLOv8 OBB (Oriented Bounding Box)** untuk deteksi objek presisi dan **Tesseract.js** untuk pengenalan teks (OCR), semuanya berjalan langsung di browser (Client-Side).

---

---

## 🚀 Fitur Utama

* **Deteksi Nutrisi Presisi (OBB):** Menggunakan model YOLOv8 Oriented Bounding Box untuk mendeteksi label nutrisi yang miring atau terdistorsi dengan lebih akurat dibandingkan bounding box standar.
* **Client-Side Inference:** Model AI berjalan sepenuhnya di browser menggunakan TensorFlow.js. Tidak ada gambar yang diunggah ke server (Privasi terjaga).
* **OCR Otomatis:** Ekstraksi angka nutrisi (Energi, Gula, Lemak, Garam, dll) menggunakan Tesseract.js.
* **Kalkulasi Nutri-Score:** Algoritma perhitungan Nutri-Score otomatis berdasarkan standar kesehatan (Simplified Algorithm).
* **Smart Cleaning:** Algoritma pembersihan data untuk memastikan angka yang dibaca valid.

---

## 🛠️ Tech Stack

* **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **AI Model:** [Ultralytics YOLOv8 (OBB)](https://github.com/ultralytics/ultralytics)
* **ML Runtime:** [TensorFlow.js](https://www.tensorflow.org/js)
* **OCR Engine:** [Tesseract.js](https://github.com/naptha/tesseract.js)

---

## 📦 Instalasi & Menjalankan Project

Ikuti langkah-langkah ini untuk menjalankan proyek di komputer lokal Anda:

### 1. Clone Repository
```bash
git clone [https://github.com/username-anda/nutriscan-ai.git](https://github.com/username-anda/nutriscan-ai.git)
cd nutriscan-ai
```

### 2\. Install Dependencies

Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/).

```bash
npm install
```

### 3\. Siapkan Model AI

Proyek ini membutuhkan model YOLOv8 yang sudah dikonversi ke format TFJS.

1.  Letakkan folder model Anda (berisi `model.json` dan file `.bin`) di dalam folder `public/`.
2.  Struktur folder harus terlihat seperti ini:
    ```
    public/
    ├── my_model/
    │   ├── model.json
    │   ├── group1-shard1of4.bin
    │   └── ...
    ```

### 4\. Jalankan Server Development

```bash
npm run dev
```

Buka browser dan akses `http://localhost:5173`.

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
