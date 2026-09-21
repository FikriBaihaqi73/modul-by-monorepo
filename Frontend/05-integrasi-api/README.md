# Bab 5: Integrasi API & Komunikasi Backend

React (Frontend) hanyalah tampilan kosong tanpa data. Ia harus berkomunikasi dengan Backend (NestJS) yang menyimpan data ke database. Untuk melakukan ini, kita melakukan proses bernama "Fetching" (Penarikan Data) lewat internet.

## 1. Environment Variable (`.env`)
Bahaya terbesar bagi pemula adalah "meng-hardcode" URL backend langsung di dalam kodingan komponen.
```tsx
// ❌ CONTOH BURUK (HARDCODE)
fetch("http://localhost:5000/auth/login")
```
Jika kita melakukan ini, saat aplikasi kita diunggah (hosting) ke internet, kita harus membongkar seluruh kode untuk mengganti URL tersebut.

**Solusinya:** Gunakan file `.env`. File ini adalah penyimpanan variabel lokal yang tidak dikirim ke GitHub.
Di Vite, file `.env` wajib diawali dengan `VITE_`:
```env
# File: apps/web/.env
VITE_API_URL=http://localhost:5000
```
Untuk membacanya di dalam kode Vite, kita menggunakan `import.meta.env`:
```ts
const url = import.meta.env.VITE_API_URL + "/auth/login";
```

## 2. API Fetch Wrapper (`src/lib/api.ts`)
Di proyek ini, kita memusatkan semua panggilan ke internet melalui satu fungsi bungkus (*wrapper*) bernama `apiFetch`.

Mengapa dibungkus?
1. Agar kita tidak perlu mengetik URL awal (`http://localhost:5000`) berulang-ulang setiap kali mau menembak backend.
2. Agar otomatis mengirimkan tipe konten `application/json`.
3. Agar penanganan error konsisten (jika API error, fungsi ini akan melempar *Throw Error* yang bisa ditangkap oleh fitur Form kita).

**Contoh `src/lib/api.ts` (Sederhana):**
```ts
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Gabungkan URL dasar dari .env dengan endpoint (misal: /auth/login)
  const url = import.meta.env.VITE_API_URL + endpoint;
  
  // Lakukan request HTTP bawaan browser
  const response = await fetch(url, { 
    ...options, 
    headers: { 'Content-Type': 'application/json' } 
  });
  
  // Cek apakah HTTP merespon dengan error (misal: 404 atau 400)
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  // Kembalikan hasil sukses (berupa JSON)
  return response.json();
}
```

## 3. Implementasi di dalam Fitur (Contoh: `register.ts`)
Setelah kita memiliki alat utamanya, barulah di dalam folder fitur (`features/auth/api/`) kita membuat fungsi spesifik.

```ts
import { apiFetch } from '@/lib/api';

export const registerApi = async (dataForm) => {
  // Hanya panggil path-nya saja!
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dataForm), // Ubah objek JavaScript jadi Teks JSON
  });
};
```
Fungsi `registerApi` inilah yang akan di-impor oleh komponen Form dan dipanggil ketika tombol "Submit" ditekan. Mudah dan rapi!
