# 01. Persiapan & Import OpenAPI ke Postman

Aplikasi NestJS yang kita bangun menyediakan endpoint OpenAPI Specification murni pada URL `/api-json`. Keunggulannya, Anda **tidak perlu membuat request satu per satu secara manual di Postman**, melainkan bisa langsung mengimpor seluruh koleksi API secara otomatis.

---

## 🚀 Langkah 1: Jalankan Server Lokal

Sebelum membuka Postman, pastikan server backend berjalan di lokal:

```bash
pnpm dev
```

Server API akan aktif pada:
- **Base URL**: `http://localhost:3000`
- **Scalar UI**: `http://localhost:3000/api`
- **OpenAPI JSON Spec**: `http://localhost:3000/api-json`

---

## 📥 Langkah 2: Import Otomatis ke Postman

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di pojok kiri atas.
3. Pada kolom URL / Search, masukkan URL OpenAPI Spec kita:
   ```text
   http://localhost:3000/api-json
   ```
4. Postman akan secara otomatis mendeteksi spesifikasi OpenAPI 3.0.
5. Klik **Import**.
6. Koleksi API bernama **"SA LMS Backend API"** akan otomatis muncul di sidebar Postman lengkap dengan seluruh endpoint (`Users`, `Products`, dll) beserta contoh payload DTO dari Zod!
