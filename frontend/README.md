# NutriScan - Frontend

Ini adalah antarmuka pengguna (Frontend) untuk aplikasi NutriScan, dibangun menggunakan **React** dan **Vite**.

## Stack Teknologi
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Vanilla CSS (`index.css`)
- **Routing**: React Router DOM
- **HTTP Client**: native `fetch` API dengan wrapper custom interceptor JWT

## Fitur Frontend
- **Autentikasi Terproteksi**: Rute login/register khusus tamu dan rute scan/history khusus pengguna terautentikasi.
- **Kamera Interaktif**: Integrasi API kamera perangkat untuk pengambilan foto langsung di browser.
- **Dynamic Routing**: Transisi halus antar layar.
- **Pixel-Perfect Design**: Desain UI yang indah, responsif, dan dinamis menggunakan animasi CSS.

## API Proxying
Dalam lingkungan *development*, frontend Vite dikonfigurasi (`vite.config.js`) untuk mem-proxy semua request dengan awalan `/api` menuju backend di `http://localhost:5001`. Ini menghindari masalah CORS saat pengembangan lokal.

## Cara Menjalankan

```bash
# Instalasi dependensi
npm install

# Menjalankan development server
npm run dev

# Build untuk produksi
npm run build
```

*Catatan: Frontend ini membutuhkan Backend yang berjalan agar aplikasi dapat berfungsi penuh (Login dan Scan tidak akan bekerja tanpa backend).*
