# Bab 5: Integrasi API & Komunikasi dengan Backend

> 🎯 **Tujuan Bab Ini:** Memahami cara frontend berkomunikasi dengan backend NestJS — dari konfigurasi URL, cara mengirim request HTTP, hingga menangani respons sukses dan error dengan elegan.

---

## 1. HTTP: Bahasa Komunikasi Frontend-Backend

Sebelum bicara kode, kita perlu memahami konsep dasar HTTP:

```
                              Internet
Browser (React)  ──── Request ────→  Server (NestJS)
                  ←─── Response ────
```

**HTTP Methods yang umum dipakai:**

| Method | Fungsi | Analogi |
|--------|--------|---------|
| `GET` | Mengambil data | "Tolong tunjukkan daftar kursus" |
| `POST` | Mengirim/membuat data baru | "Tolong daftarkan akun saya" |
| `PUT` | Mengupdate seluruh data | "Tolong ganti semua info profil saya" |
| `PATCH` | Mengupdate sebagian data | "Tolong ganti hanya email saya" |
| `DELETE` | Menghapus data | "Tolong hapus akun saya" |

**HTTP Status Code yang penting:**

| Kode | Arti |
|------|------|
| `200 OK` | Sukses |
| `201 Created` | Data baru berhasil dibuat |
| `400 Bad Request` | Request dari client salah (validasi gagal) |
| `401 Unauthorized` | Belum login |
| `403 Forbidden` | Sudah login tapi tidak punya akses |
| `404 Not Found` | Data tidak ditemukan |
| `500 Internal Server Error` | Bug di server |

---

## 2. Environment Variables: Jangan Hardcode URL!

### 2.1 Masalah Hardcode

```tsx
// ❌ SANGAT BURUK — URL di-hardcode langsung di kode
const data = await fetch('http://localhost:5000/auth/login');
//                        ↑ Ini HANYA berjalan di komputer lokal!

// Saat deploy ke production (internet):
// - URL berubah menjadi 'https://api.sa-lms.com/auth/login'
// - Kamu harus cari semua file yang berisi URL itu dan ganti satu per satu
// - Rawan kelewatan dan bug
```

### 2.2 Solusi: File `.env`

File `.env` adalah file konfigurasi yang **tidak pernah di-commit ke Git** (sudah ada di `.gitignore`). Isinya bisa berbeda di setiap environment (lokal, staging, production):

```env
# apps/web/.env (untuk development lokal)
VITE_API_URL=http://localhost:5000
```

```env
# apps/web/.env.production (untuk production)
VITE_API_URL=https://api.sa-lms.com
```

**Aturan Vite:** Semua variabel environment yang ingin diakses dari kode React **WAJIB** diawali dengan `VITE_`. Ini adalah keamanan bawaan Vite agar variabel sensitif tidak bocor ke browser.

### 2.3 Membaca `.env` di Kode Vite

```ts
// Cara mengakses environment variable di Vite:
const apiUrl = import.meta.env.VITE_API_URL;
//             ↑ Bukan process.env! Khusus Vite menggunakan import.meta.env

// Cek apakah ada:
if (!import.meta.env.VITE_API_URL) {
  console.warn('Variabel VITE_API_URL tidak di-set!');
}
```

**Perbedaan dengan Node.js / Create React App:**
```
Node.js / CRA:   process.env.REACT_APP_API_URL
Vite:            import.meta.env.VITE_API_URL
```

---

## 3. `apiFetch` — Wrapper HTTP yang Terpusat

### 3.1 Mengapa Perlu Wrapper?

Bayangkan tanpa wrapper:

```tsx
// Di LoginForm.tsx
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },  // Harus ingat tulis ini setiap kali!
  body: JSON.stringify(data),
});
if (!response.ok) { /* Harus handle error sendiri */ }

// Di RegisterForm.tsx — DUPLIKAT!
const response = await fetch('http://localhost:5000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },  // Lagi!
  body: JSON.stringify(data),
});
if (!response.ok) { /* Harus handle error lagi */ }

// Di GetKursus.ts — DUPLIKAT LAGI!
const response = await fetch('http://localhost:5000/kursus', {
  headers: { 'Content-Type': 'application/json' },  // Lagi dan lagi!
  // Belum lagi harus tambah Authorization header nanti...
});
```

Dengan wrapper `apiFetch`, semua konfigurasi berulang ada di satu tempat.

### 3.2 Bedah `apiFetch` Baris per Baris

```ts
// apps/web/src/lib/api.ts — PENJELASAN LENGKAP

/**
 * Centralized API configuration
 */

// 1. Baca URL dari environment variable
const API_URL = import.meta.env.VITE_API_URL;

// 2. Tampilkan warning jika variabel tidak di-set
if (!API_URL) {
  console.warn("VITE_API_URL is not defined in environment variables. Falling back to default.");
}

// 3. Konfigurasi yang bisa diakses dari luar jika diperlukan
export const config = {
  apiUrl: API_URL || "http://localhost:5000",  // Fallback ke localhost jika tidak ada
};

/**
 * 4. Fungsi fetch wrapper utama
 *
 * @param endpoint - Path API (contoh: '/auth/login', '/kursus', '/users/me')
 * @param options  - Opsi fetch native (method, body, headers, dll.)
 * @returns        - Response body yang sudah di-parse ke JSON
 * @throws         - Error dengan pesan dari server jika request gagal
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  //                                                       ↑ = {} berarti parameter opsional
  //                                                         jika tidak diisi, default {}

  // 5. Gabungkan base URL dengan endpoint
  const url = `${config.apiUrl}${endpoint}`;
  // Contoh: "http://localhost:5000" + "/auth/login" = "http://localhost:5000/auth/login"

  console.log('Sending request to:', url);  // Berguna saat debugging

  // 6. Siapkan headers — gabungkan default dengan headers dari luar (jika ada)
  const headers = {
    'Content-Type': 'application/json',  // Default: kita mengirim JSON
    ...options.headers,                   // Tambahkan/timpa dengan headers dari pemanggil
    //                                    // (misalnya: Authorization: 'Bearer token123')
  };

  // 7. Jalankan request HTTP menggunakan Fetch API bawaan browser
  const response = await fetch(url, {
    ...options,   // Teruskan method, body, dll. dari pemanggil
    headers,      // Gunakan headers yang sudah digabung di atas
  });

  // 8. Cek apakah server merespons dengan error
  if (!response.ok) {
    //          ↑ response.ok = true jika status code 200-299
    //                        = false jika 400, 401, 403, 404, 500, dll.

    // Coba ambil pesan error dari body respons
    const errorData = await response.json().catch(() => null);
    //                                         ↑ .catch(() => null): jika body bukan JSON,
    //                                           kembalikan null (jangan crash)

    // Lempar error agar bisa di-catch oleh pemanggil
    throw new Error(
      errorData?.message ||  // Gunakan pesan dari server jika ada
      `API request failed with status ${response.status}`  // Fallback
    );
  }

  // 9. Jika sukses, parse body menjadi objek JavaScript dan kembalikan
  return response.json();
}
```

### 3.3 Struktur Respons dari Backend (NestJS + ResponseHelper)

Backend SA-LMS selalu mengembalikan respons dalam format konsisten:

```json
{
  "status": "success",
  "message": "Login successful",
  "code": 200,
  "data": {
    "user": {
      "id": "uuid-disini",
      "email": "budi@example.com",
      "role": "student"
    },
    "token": "eyJhbGci..."
  }
}
```

Atau jika error:
```json
{
  "status": "error",
  "code": 401,
  "message": "Invalid credentials",
  "errors": null
}
```

Karena itu, di `loginApi` kita mengambil data dari `response.data.user`:

```ts
// apps/web/src/features/auth/api/login.ts

export const loginApi = async (credentials: LoginCredentials): Promise<User> => {
  // apiFetch mengembalikan KESELURUHAN respons JSON (termasuk status, message, data)
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),  // Ubah objek JS menjadi string JSON
  });

  // Kita hanya perlu bagian 'user' dari 'data'
  // response = { status: 'success', message: '...', data: { user: {...}, token: '...' } }
  return response.data.user;
  //              ↑↑↑↑ Sesuaikan dengan struktur respons backend!
};
```

---

## 4. Layer API di Folder Fitur

### 4.1 Struktur Layer API

```
features/auth/api/
├── login.ts       ← Fungsi spesifik untuk endpoint POST /auth/login
└── register.ts    ← Fungsi spesifik untuk endpoint POST /auth/register
```

Setiap file di folder `api/` adalah "jembatan" tipis antara komponen React dan endpoint backend spesifik.

### 4.2 `login.ts` — API Login

```ts
// apps/web/src/features/auth/api/login.ts

import type { User, LoginCredentials } from '../types';  // Tipe TypeScript
import { apiFetch } from '@/lib/api';                    // Wrapper fetch

/**
 * Memanggil endpoint POST /auth/login
 * @param credentials - { email: string, password: string }
 * @returns User object jika berhasil
 * @throws Error jika credentials salah atau server error
 */
export const loginApi = async (credentials: LoginCredentials): Promise<User> => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  return response.data.user;
};
```

### 4.3 `register.ts` — API Register

```ts
// apps/web/src/features/auth/api/register.ts

import type { RegisterSchema } from '@repo/shared/schemas/auth.schema';
import * as z from 'zod';
import { apiFetch } from '@/lib/api';

// Ambil tipe dari skema Zod yang dipakai di shared
type RegisterDto = z.infer<typeof RegisterSchema>;
// Hasilnya: { email: string, password: string, role: 'student' | 'instansi', institutionName?: string }

/**
 * Memanggil endpoint POST /auth/register
 * @param data - Data registrasi user
 * @returns void — tidak mengembalikan apapun (register tidak perlu auto-login)
 */
export const registerApi = async (data: RegisterDto): Promise<void> => {
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  // Tidak ada return value — jika tidak throw, berarti berhasil
};
```

---

## 5. Cara Kerja `JSON.stringify` dan `JSON.parse`

Ini konsep dasar tapi sering membingungkan pemula:

```ts
// Data yang kita punya adalah OBJEK JavaScript:
const loginData = { email: "budi@example.com", password: "rahasia123" };

// HTTP hanya bisa mengirim TEXT (string), bukan objek!
// JSON.stringify mengubah objek → string JSON:
const jsonString = JSON.stringify(loginData);
// Hasilnya: '{"email":"budi@example.com","password":"rahasia123"}'
// ↑ Ini adalah string, bukan objek!

// Di sisi server, string ini di-parse kembali menjadi objek:
const kembaliJadiObjek = JSON.parse(jsonString);
// { email: "budi@example.com", password: "rahasia123" }

// Saat menerima respons dari server:
const response = await fetch(url);
const data = await response.json();
// response.json() = JSON.parse(await response.text())
// Mengubah text JSON dari server → objek JavaScript
```

---

## 6. Async/Await: Cara Menulis Kode Asinkronus dengan Bersih

Memanggil API membutuhkan waktu (jaringan internet). JavaScript tidak bisa "menunggu" secara biasa karena akan membekukan seluruh browser.

### 6.1 Cara Kerja Async/Await

```ts
// Tanpa async/await (menggunakan Promise chain — susah dibaca):
loginApi(data)
  .then(user => {
    setState({ user, isAuthenticated: true });
    return fetchUserProfile(user.id);
  })
  .then(profile => {
    setProfile(profile);
  })
  .catch(error => {
    setError(error.message);
  });

// Dengan async/await (seperti kode biasa, lebih mudah dibaca):
const login = async (credentials: LoginCredentials) => {
  try {
    const user = await loginApi(credentials);          // "Tunggu" hasil loginApi
    const profile = await fetchUserProfile(user.id);   // "Tunggu" lagi
    setState({ user, isAuthenticated: true });
    setProfile(profile);
  } catch (error) {
    setError(error.message);  // Tangkap error dari manapun
  }
};
```

### 6.2 `async/await` di Komponen React

```tsx
// apps/web/src/features/auth/components/LoginForm.tsx (baris 34-42)

// Fungsi ini adalah 'async' karena berisi 'await'
const onSubmit = async (data: LoginFormValues) => {
  try {
    setError('');          // Reset pesan error lama
    await login(data);     // Tunggu sampai proses login selesai
    //          ↑ React Hook Form otomatis set isSubmitting = true saat ini berlangsung
    // Jika berhasil: lanjut baris berikutnya
    // Jika gagal: langsung loncat ke catch
  } catch {
    // Ini dieksekusi jika loginApi() throw Error
    setError('Invalid credentials or login failed');
  }
  // Setelah try-catch selesai, RHF otomatis set isSubmitting = false
};
```

**Mengapa `isSubmitting` bekerja otomatis?**

React Hook Form memantau kapan fungsi `onSubmit` selesai. Selama fungsi `async` masih "menunggu" (belum resolved atau rejected), `isSubmitting = true`. Begitu fungsi selesai (baik sukses atau gagal), `isSubmitting = false` otomatis.

---

## 7. Error Handling: Menangani Berbagai Kemungkinan Gagal

```ts
// Error bisa terjadi di beberapa level:

// Level 1: Network Error (tidak ada koneksi internet)
// fetch() akan throw TypeError
try {
  await fetch(url);
} catch (error) {
  // error adalah: TypeError: Failed to fetch
}

// Level 2: Server Error (status 400-500)
// apiFetch() kita yang throw Error ini
const response = await fetch(url);
if (!response.ok) {
  throw new Error('Login failed with status 401');
}

// Level 3: Parsing Error (server tidak mengembalikan JSON)
const data = await response.json(); // Bisa throw SyntaxError
// apiFetch kita sudah handle ini dengan .catch(() => null)
```

**Handling error di komponen:**

```tsx
// Di RegisterForm.tsx (baris 49-62)
const onSubmit = async (data: RegisterFormValues) => {
  try {
    setError('');
    setSuccess('');
    await registerApi({
      email: data.email,
      password: data.password,
      role: data.role,
      institutionName: data.institutionName,
    });
    // Jika tidak throw, berarti sukses:
    setSuccess('Account created successfully! You can now sign in.');
  } catch (err: unknown) {
    // err bisa berupa Error object dari apiFetch
    if (err instanceof Error) {
      setError(err.message || 'Registration failed');
    } else {
      setError('Registration failed');
    }
  }
};
```

---

## 8. Menambahkan Authorization Header (Untuk Endpoint yang Membutuhkan Login)

Saat mengakses endpoint yang memerlukan authentication (misalnya GET /user/profile), kita perlu mengirim token:

```ts
// Cara mengirim token di apiFetch:
const response = await apiFetch('/user/profile', {
  method: 'GET',
  headers: {
    // Tambahkan Authorization header
    'Authorization': `Bearer ${token}`,
    //                 ↑ Format standar: "Bearer " + token JWT
  },
});

// apiFetch akan menggabungkan headers:
// Default: { 'Content-Type': 'application/json' }
// Ditambah: { 'Authorization': 'Bearer eyJ...' }
// Hasil: { 'Content-Type': '...', 'Authorization': '...' }
```

**Catatan:** Di fase berikutnya proyek SA-LMS, token akan disimpan di localStorage atau Context, kemudian secara otomatis ditambahkan ke setiap request oleh `apiFetch` yang diperluas.

---

## 9. Alur Lengkap: Dari Klik Tombol ke Database

Berikut alur lengkap saat user register di SA-LMS:

```
1. User mengisi form dan klik "Register"
              ↓
2. handleSubmit(onSubmit) dipanggil oleh RHF
              ↓
3. zodResolver memvalidasi data dengan FrontendRegisterSchema
              ↓
   ┌──────────┴──────────┐
   │                     │
GAGAL                  LOLOS
   │                     │
   ↓                     ↓
errors diisi         onSubmit(data) dipanggil
UI tampilkan error   isSubmitting = true
                     Tombol "Register" di-disable
                              ↓
                  registerApi(data) dipanggil
                  [features/auth/api/register.ts]
                              ↓
                  apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify(data)
                  })
                  [lib/api.ts]
                              ↓
                  fetch('http://localhost:5000/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"email":"...","password":"...","role":"..."}'
                  })
                  [Browser Fetch API]
                              ↓
                    NestJS Backend menerima request
                    → Validasi dengan RegisterSchema (sama persis!)
                    → Simpan ke database via Prisma
                    → Kembalikan respons
                              ↓
                   ┌──────────┴──────────┐
                   │                     │
               ERROR                  SUCCESS
               400/500                 201
                   │                     │
                   ↓                     ↓
            apiFetch throw          apiFetch return
            new Error('...')        response.json()
                   │                     │
                   ↓                     ↓
            catch block             setSuccess('Account created!')
            setError('...')         isSubmitting = false
```

---

## 10. Rangkuman Bab 5

| Konsep | Penjelasan | Contoh |
|--------|------------|--------|
| **`.env`** | File konfigurasi environment | `VITE_API_URL=http://localhost:5000` |
| **`import.meta.env`** | Cara baca `.env` di Vite | `import.meta.env.VITE_API_URL` |
| **`apiFetch`** | Wrapper HTTP terpusat | `apiFetch('/auth/login', { method: 'POST' })` |
| **`JSON.stringify`** | Objek JS → String JSON | `body: JSON.stringify({ email, password })` |
| **`response.json()`** | String JSON → Objek JS | `const data = await response.json()` |
| **`async/await`** | Kode asinkronus yang mudah dibaca | `const user = await loginApi(data)` |
| **`try/catch`** | Tangkap error dari operasi async | `try { await login() } catch { setError() }` |
| **`response.ok`** | Cek apakah status HTTP 200-299 | `if (!response.ok) throw new Error(...)` |

---

> 🚀 **Langkah Selanjutnya:** Kita bisa berkomunikasi dengan backend. Di **Bab 6**, kita akan belajar cara menyimpan data yang sudah didapat (seperti info user yang login) agar bisa diakses oleh seluruh aplikasi, menggunakan React Context.
