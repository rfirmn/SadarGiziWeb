# NutriScan API Documentation

Dokumentasi ini berisi daftar endpoint yang tersedia di backend NutriScan. Base URL untuk semua endpoint (jika dijalankan lokal) adalah:
`http://localhost:5001/api`

---

## 1. Authentication (`/auth`)

Semua endpoint untuk autentikasi user.

### 1.1 Register
Mendaftarkan akun pengguna baru.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com"
  }
}
```

### 1.2 Login
Autentikasi akun yang sudah ada.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com"
  }
}
```

### 1.3 Get Me
Mendapatkan profil user yang sedang login (membutuhkan Token).

- **URL:** `/auth/me`
- **Method:** `GET`
- **Headers:** 
  - `Authorization: Bearer <token_jwt>`

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "created_at": "2024-05-10T08:00:00.000Z"
  }
}
```

---

## 2. Scan & Analysis (`/scan`)

Membutuhkan **Authorization Header** (`Bearer <token_jwt>`).

### 2.1 Upload & Scan Image
Endpoint utama untuk menganalisis gambar informasi nilai gizi. Proses ini akan menjalankan model YOLOv8 dan Tesseract OCR di sisi server, serta otomatis menyimpan hasilnya ke dalam tabel riwayat.

- **URL:** `/scan`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Headers:** 
  - `Authorization: Bearer <token_jwt>`

**Request Body:**
- `image`: File gambar (JPG/PNG). Harus dikirim sebagai Multipart File. (Misalnya dari Flutter menggunakan `http.MultipartRequest`).

**Success Response (201 Created):**
```json
{
  "id": "e6f4b638-...", 
  "nutritionData": {
    "kalori": 150,
    "gula": 12,
    "garam": 200,
    "lemak": 5,
    "karbo": 25,
    "protein": 3,
    "serat": 2,
    "serving": 1,
    "takaran-satuan": 30
  },
  "totalNutrients": {
    "kalori": 150,
    "gula": 12,
    "garam": 200,
    "lemak": 5,
    "karbo": 25,
    "protein": 3,
    "serat": 2
  },
  "nutriScore": "C",
  "imagePath": "nama-file-gambar-di-server.jpg",
  "rawData": {
    "kalori": "150 kkal",
    "gula": "12g"
  }
}
```

### 2.2 Get Single Scan
Mendapatkan detail satu hasil scan spesifik milik user.

- **URL:** `/scan/:id`
- **Method:** `GET`
- **Headers:** 
  - `Authorization: Bearer <token_jwt>`

**Success Response (200 OK):**
```json
{
  "record": {
    "id": "e6f4b638-...",
    "user_id": 1,
    "image_path": "nama-file.jpg",
    "kalori": 150,
    "gula": 12,
    "garam": 200,
    "lemak": 5,
    "karbo": 25,
    "protein": 3,
    "serat": 2,
    "serving": 1,
    "takaran_satuan": 30,
    "nutri_score": "C",
    "raw_ocr_data": { ... },
    "scanned_at": "2024-05-10T10:00:00.000Z"
  }
}
```

---

## 3. History (`/history`)

Membutuhkan **Authorization Header** (`Bearer <token_jwt>`).

### 3.1 Get All History (Paginated)
Mendapatkan riwayat hasil scan untuk user yang sedang login, diurutkan dari yang terbaru.

- **URL:** `/history`
- **Method:** `GET`
- **Headers:** 
  - `Authorization: Bearer <token_jwt>`
- **Query Parameters (Optional):**
  - `page`: Nomor halaman (default: 1)
  - `limit`: Jumlah data per halaman (default: 20, max: 50)

**Success Response (200 OK):**
```json
{
  "records": [
    {
      "id": "e6f4b638-...",
      "date": "2024-05-10T10:00:00.000Z",
      "kalori": 150,
      "gula": 12,
      "garam": 200,
      "lemak": 5,
      "karbo": 25,
      "protein": 3,
      "serat": 2,
      "nutri_score": "C",
      "image_path": "nama-file.jpg"
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### 3.2 Delete Single Record
Menghapus satu riwayat berdasarkan ID. (Juga akan menghapus file gambar terkait di server).

- **URL:** `/history/:id`
- **Method:** `DELETE`
- **Headers:** 
  - `Authorization: Bearer <token_jwt>`

**Success Response (200 OK):**
```json
{
  "success": true
}
```

### 3.3 Clear All History
Menghapus semua riwayat scan milik user tersebut beserta file gambarnya.

- **URL:** `/history`
- **Method:** `DELETE`
- **Headers:** 
  - `Authorization: Bearer <token_jwt>`

**Success Response (200 OK):**
```json
{
  "success": true,
  "deletedCount": 5
}
```

---

## Error Handling

Jika terjadi error, backend akan mengembalikan status HTTP di luar jangkauan `2xx` (seperti `400`, `401`, `404`, atau `500`) dengan body berformat JSON berikut:

```json
{
  "error": "Pesan error yang menjelaskan kesalahan"
}
```

Contoh HTTP Status yang sering muncul:
- `400 Bad Request`: Validasi gagal (misal email salah) atau file gambar terlalu besar.
- `401 Unauthorized`: Token JWT tidak dikirim, token expired, atau email/password salah.
- `404 Not Found`: Data riwayat atau user tidak ditemukan.
- `409 Conflict`: Email sudah digunakan saat registrasi.
- `500 Internal Server Error`: Kesalahan sistem pada backend.
