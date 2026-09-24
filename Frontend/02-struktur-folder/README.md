# Bab 2: Struktur Folder Frontend (Feature-Sliced Design)

> 🎯 **Tujuan Bab Ini:** Memahami *mengapa* kita menyusun file seperti yang ada di proyek, sehingga kamu bisa menemukan dan menambahkan file baru dengan tepat tanpa harus bingung.

---

## 1. Masalah Tanpa Struktur yang Baik

Bayangkan kamu menaruh semua file di satu folder `src/`:

```
src/
  LoginForm.tsx
  RegisterForm.tsx
  Button.tsx
  Input.tsx
  api-login.js
  api-register.js
  auth-context.js
  homepage.tsx
  user-profile.tsx
  ... (ratusan file lagi)
```

Saat ada bug di fitur login, kamu harus menyisir **ratusan file** untuk menemukan yang relevan. Ini disebut masalah **"Spaghetti Code"** — semua hal saling terkait tanpa aturan jelas.

**Solusinya: Feature-Sliced Design (FSD)** — sebuah pendekatan arsitektur yang mengorganisir kode berdasarkan **fitur bisnis** (bukan berdasarkan tipe file).

---

## 2. Peta Lengkap Folder Proyek SA-LMS

Mari kita bedah struktur `apps/web/src/` baris per baris:

```
apps/web/
│
├── index.html                  ← Entry HTML (dimuat Vite)
├── vite.config.ts              ← Konfigurasi Vite + Tailwind + Alias
├── tsconfig.app.json           ← Konfigurasi TypeScript
├── package.json                ← Daftar dependensi dan script
├── .env                        ← Variabel environment (jangan di-commit!)
│
└── src/
    ├── main.tsx                ← Entry point React (di sinilah React "dipasang")
    ├── App.tsx                 ← Komponen root (pengatur routing/halaman)
    ├── index.css               ← CSS global (import Tailwind di sini)
    │
    ├── assets/                 ← File statis (gambar, font, dll.)
    │   └── react.svg
    │
    ├── components/             ← Komponen UNIVERSAL (bisa dipakai di mana saja)
    │   ├── layout/             ← Komponen tata letak (Navbar, Sidebar, Footer)
    │   └── ui/                 ← Komponen UI primitif dari shadcn/ui
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       └── select.tsx
    │
    ├── features/               ← Fitur-fitur aplikasi (dikelompokkan per domain)
    │   └── auth/               ← Domain: Otentikasi (login, register, logout)
    │       ├── index.ts        ← Barrel file (re-export semua dari folder ini)
    │       ├── api/            ← Fungsi pemanggil API
    │       │   ├── login.ts
    │       │   └── register.ts
    │       ├── components/     ← Komponen spesifik fitur auth
    │       │   ├── LoginForm.tsx
    │       │   └── RegisterForm.tsx
    │       ├── context/        ← State global fitur auth (React Context)
    │       │   └── AuthContext.tsx
    │       ├── hooks/          ← Custom hooks fitur auth
    │       │   └── useAuth.ts
    │       └── types/          ← Tipe TypeScript khusus auth
    │           └── index.ts
    │
    ├── hooks/                  ← Custom hooks UNIVERSAL (dipakai lintas fitur)
    │
    ├── lib/                    ← Utilitas/alat bantu (tidak ada tampilan UI)
    │   ├── api.ts              ← Konfigurasi fetch wrapper
    │   └── utils.ts            ← Fungsi cn() untuk Tailwind
    │
    └── types/                  ← Tipe TypeScript global
```

---

## 3. Bedah Per Folder: Fungsi dan Aturannya

### 3.1 `src/main.tsx` — Pintu Masuk Aplikasi

Ini adalah **satu-satunya file** yang langsung "memasang" React ke dalam HTML. Semua hal dimulai dari sini.

```tsx
// apps/web/src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'   // CSS global HARUS diimport di sini
import App from './App.tsx'

// createRoot: memasang React ke dalam <div id="root"> di index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Aturan:** File ini tidak berubah-ubah. Jangan taruh logika bisnis di sini.

---

### 3.2 `src/App.tsx` — Pengatur Halaman/Routing

`App.tsx` adalah komponen "root" yang menentukan **halaman apa yang ditampilkan**. Di proyek yang sudah matang, biasanya ada TanStack Router di sini. Saat ini, masih menggunakan `useState` sederhana untuk toggle antara Login dan Register:

```tsx
// apps/web/src/App.tsx

import { useState } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

function App() {
  // State untuk menentukan form mana yang ditampilkan
  const [view, setView] = useState<'login' | 'register'>('login')
  //                                ↑ Union type: hanya 2 nilai yang valid

  return (
    // AuthProvider membungkus seluruh app agar semua komponen bisa akses data auth
    <AuthProvider>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center">
        {view === 'login' ? (
          // Kirim fungsi sebagai props untuk navigasi antar form
          <LoginForm onRegisterClick={() => setView('register')} />
        ) : (
          <RegisterForm onLoginClick={() => setView('login')} />
        )}
      </main>
    </AuthProvider>
  )
}

export default App
```

**Mengapa `AuthProvider` membungkus semuanya?** Karena data auth (user yang login) harus bisa diakses oleh komponen di mana saja (Navbar, Sidebar, halaman manapun). Dengan membungkus di `App.tsx`, seluruh aplikasi bisa "melihat" data tersebut.

---

### 3.3 `src/components/ui/` — Komponen UI Primitif

Ini adalah folder komponen yang **tidak tahu tentang bisnis apapun**. Mereka adalah "bata" dasar seperti `Button`, `Input`, `Card`, dll.

```tsx
// apps/web/src/components/ui/input.tsx
// Input ini tidak tahu apakah ia dipakai untuk email, password, atau nama.
// Ia hanya tahu cara menampilkan input yang sesuai desain.

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Class dasar untuk semua input
          "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-base ...",
          className  // Class tambahan dari luar (bisa override)
        )}
        ref={ref}
        {...props}  // Teruskan semua props lain (onChange, onBlur, value, dll.)
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**Aturan Komponen UI:**
- ✅ Boleh: Menerima `className` untuk kustomisasi visual
- ✅ Boleh: Meneruskan semua props HTML native (`onChange`, `value`, `disabled`, dll.)
- ❌ Dilarang: Berisi logika bisnis (pemanggilan API, validasi form, dll.)

---

### 3.4 `src/features/` — Jantung Arsitektur FSD

Ini adalah folder terpenting. Setiap sub-folder adalah **satu domain bisnis** yang self-contained (semua yang diperlukan fitur tersebut ada di dalam folder itu).

**Struktur dalam satu fitur (contoh: `auth/`):**

```
features/auth/
│
├── index.ts           ← Barrel: re-export semua public API dari fitur ini
│
├── types/index.ts     ← Interface TypeScript yang dipakai di fitur ini
│   ├── User
│   ├── LoginCredentials
│   └── AuthState
│
├── api/               ← Layer komunikasi ke Backend (HTTP calls)
│   ├── login.ts       ← Fungsi loginApi() yang memanggil POST /auth/login
│   └── register.ts    ← Fungsi registerApi() yang memanggil POST /auth/register
│
├── context/           ← State management global (React Context)
│   └── AuthContext.tsx ← AuthProvider + AuthContext
│
├── hooks/             ← Custom hooks (abstraksi logika yang bisa dipakai ulang)
│   └── useAuth.ts     ← Shortcut untuk mengakses AuthContext
│
└── components/        ← Komponen tampilan (UI) khusus fitur ini
    ├── LoginForm.tsx
    └── RegisterForm.tsx
```

**Alur data dalam fitur auth:**

```
User mengetik di LoginForm.tsx
    ↓
LoginForm memanggil fungsi dari useForm (React Hook Form)
    ↓
Saat submit, LoginForm memanggil useAuth().login()
    ↓
useAuth() mengambil fungsi login dari AuthContext
    ↓
AuthContext memanggil loginApi() dari api/login.ts
    ↓
loginApi() memanggil apiFetch() dari lib/api.ts
    ↓
apiFetch() melakukan HTTP POST ke backend
    ↓
Respons kembali ke AuthContext → update state → UI ikut berubah
```

---

### 3.5 `src/features/auth/index.ts` — Barrel File

File ini adalah "jendela" dari sebuah fitur. Ia mengumpulkan semua export dari sub-folder dan menyajikannya dengan rapi.

```ts
// apps/web/src/features/auth/index.ts

// Semua yang ada di fitur auth bisa diimpor dari satu tempat:
// import { useAuth, LoginForm, AuthProvider } from '@/features/auth'

export * from './types';
export * from './api/login';
export * from './context/AuthContext';
export * from './hooks/useAuth';
export * from './components/LoginForm';
export * from './components/RegisterForm';
export * from './api/register';
```

**Keuntungan barrel file:**
```tsx
// Tanpa barrel file (harus tahu path dalam-dalam)
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { AuthProvider } from '@/features/auth/context/AuthContext';

// Dengan barrel file (lebih bersih)
import { useAuth, LoginForm, AuthProvider } from '@/features/auth';
```

---

### 3.6 `src/lib/` — Utilitas Non-UI

Folder ini berisi fungsi-fungsi pembantu yang **tidak memiliki tampilan** dan bisa dipakai oleh komponen/fitur mana saja.

```ts
// apps/web/src/lib/utils.ts

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn() = fungsi untuk menggabungkan class Tailwind dengan aman
// Contoh: cn("p-4 bg-red-500", "bg-blue-500") → "p-4 bg-blue-500"
// (warna background tidak duplikat, yang terakhir menang)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```ts
// apps/web/src/lib/api.ts
// Semua panggilan HTTP harus melalui sini, bukan langsung fetch()

const API_URL = import.meta.env.VITE_API_URL;

export const config = {
  apiUrl: API_URL || "http://localhost:5000",
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${config.apiUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }
  return response.json();
}
```

---

## 4. Aturan Emas Arsitektur Ini

| Aturan | Penjelasan | Contoh Pelanggaran |
|--------|------------|-------------------|
| **Komponen UI tidak boleh berisi logika bisnis** | `button.tsx` tidak boleh memanggil API | `button.tsx` berisi `fetch('/auth/login')` |
| **Fitur tidak boleh impor langsung dari fitur lain** | `features/materi` tidak boleh impor dari `features/auth/context` | Impor langsung ke file internal fitur lain |
| **API call hanya di folder `api/`** | Tidak ada `fetch()` langsung di komponen | `LoginForm.tsx` berisi `fetch('/auth/login')` langsung |
| **State global hanya di Context atau Query** | Jangan simpan data server di `useState` komponen | Simpan list users di `useState` dalam halaman |
| **Semua URL API dari `.env`** | Jangan hardcode URL | `fetch('http://localhost:5000/...')` langsung di kode |

---

## 5. Menambahkan Fitur Baru (Panduan Praktis)

Misalnya kita ingin menambahkan fitur **"Manajemen Kursus"**. Begini caranya:

**Langkah 1:** Buat folder fitur baru:
```
src/features/kursus/
├── index.ts
├── types/
│   └── index.ts       ← interface Kursus { id, judul, deskripsi, ... }
├── api/
│   ├── getKursus.ts   ← function getKursusApi()
│   └── createKursus.ts
├── hooks/
│   └── useKursus.ts   ← useQuery wrapper untuk list kursus
└── components/
    ├── KursusList.tsx
    └── KursusCard.tsx
```

**Langkah 2:** Tambahkan tipe:
```ts
// src/features/kursus/types/index.ts
export interface Kursus {
  id: string;
  judul: string;
  deskripsi: string;
  createdAt: string;
}
```

**Langkah 3:** Buat API call:
```ts
// src/features/kursus/api/getKursus.ts
import { apiFetch } from '@/lib/api';
import type { Kursus } from '../types';

export const getKursusApi = async (): Promise<Kursus[]> => {
  const response = await apiFetch('/kursus');
  return response.data; // Sesuaikan dengan struktur respons backend
};
```

**Langkah 4:** Buat komponen:
```tsx
// src/features/kursus/components/KursusList.tsx
import { getKursusApi } from '../api/getKursus';
import { KursusCard } from './KursusCard';

// ... tampilkan list kursus
```

---

## 6. Rangkuman Bab 2

```
Mau tambah komponen UI baru?         → src/components/ui/
Mau tambah komponen layout baru?     → src/components/layout/
Mau tambah fitur domain baru?        → src/features/[nama-fitur]/
Mau tambah pemanggil API baru?       → src/features/[nama-fitur]/api/
Mau tambah hook yang bisa dipakai ulang? → src/hooks/ (global) atau src/features/[nama]/hooks/
Mau tambah fungsi utilitas?          → src/lib/
Mau tambah tipe TypeScript global?   → src/types/
```

> 🚀 **Langkah Selanjutnya:** Sekarang kamu tahu di mana setiap file harus tinggal. Di **Bab 3**, kita akan belajar cara membuat tampilan yang indah menggunakan Tailwind CSS dan komponen shadcn/ui yang sudah ada di proyek.
