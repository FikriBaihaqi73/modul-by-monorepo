# Bab 1: Pengenalan React & Ekosistem Dasar

> 🎯 **Tujuan Bab Ini:** Memahami dari nol mengapa React ada, bagaimana cara kerjanya, dan apa saja sintaks dasarnya sebelum kita menyentuh kode nyata di proyek.

---

## 1. Mengapa React? Masalah yang Ia Selesaikan

Bayangkan kamu membangun halaman web biasa dengan HTML, CSS, dan JavaScript murni:

```html
<!-- index.html -->
<p id="counter">Kamu sudah klik: 0 kali</p>
<button onclick="tambah()">Klik Saya</button>

<script>
  let count = 0;
  function tambah() {
    count++;
    // Kita harus "cari" elemennya dulu, baru ubah isinya secara manual
    document.getElementById('counter').innerText = 'Kamu sudah klik: ' + count + ' kali';
  }
</script>
```

Sekarang bayangkan ada 100 komponen berbeda di halaman yang datanya saling berubah. Kamu harus menulis `document.getElementById(...)` ratusan kali. Sangat melelahkan dan rawan bug!

**React hadir untuk menyelesaikan ini.** Konsep utamanya sederhana:

> **"Ceritakan bagaimana tampilanmu *seharusnya* terlihat untuk data tertentu, dan React yang akan mengurus perubahannya."**

```tsx
// Cara React: Deklaratif, bukan Imperatif
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0); // "ingatan" komponen ini

  // Kita hanya mendeskripsikan tampilan, React yang update otomatis
  return (
    <div>
      <p>Kamu sudah klik: {count} kali</p>
      <button onClick={() => setCount(count + 1)}>Klik Saya</button>
    </div>
  );
}
```

---

## 2. Apa Itu Komponen (Component)?

Komponen adalah **blok bangunan dasar React**. Konsepnya seperti membuat "custom HTML tag" sendiri.

Setiap komponen adalah sebuah **fungsi JavaScript** yang:
1. Menerima data dari luar (disebut **Props**)
2. Mengembalikan tampilan (dalam format **JSX**)

### 2.1 Anatomi Sebuah Komponen

```tsx
// Komponen paling sederhana di dunia
// File: src/components/ui/button.tsx (versi sederhana)

//   ↓ Fungsi biasa JavaScript, tapi namanya Kapital (konvensi React)
function Tombol() {
  //   ↓ Return berisi JSX (mirip HTML)
  return (
    <button>Klik Saya</button>
  );
}

// Wajib di-export agar bisa dipakai di tempat lain
export default Tombol;
```

### 2.2 Komponen dengan Props (Data dari Luar)

Props adalah cara "orang tua" memberikan data ke "anak". Seperti atribut HTML, tapi lebih powerful.

```tsx
// Definisikan "kontrak" data menggunakan TypeScript interface
interface TombolProps {
  label: string;         // Wajib ada
  warna?: string;        // Opsional (tanda tanya = boleh tidak ada)
  onClick: () => void;   // Fungsi yang dipanggil saat diklik
}

// Komponen menerima props sebagai parameter pertama
function Tombol({ label, warna = 'blue', onClick }: TombolProps) {
  return (
    <button
      style={{ backgroundColor: warna }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// Cara memakainya:
function App() {
  return (
    <div>
      {/* Seperti atribut HTML, kita kirim data lewat sini */}
      <Tombol label="Simpan" onClick={() => console.log('disimpan!')} />
      <Tombol label="Hapus" warna="red" onClick={() => console.log('dihapus!')} />
    </div>
  );
}
```

### 2.3 Komponen di Proyek SA-LMS

Di proyek kita, komponen dipisah menjadi dua jenis:

**Komponen UI Universal** → `src/components/ui/` (contoh: `button.tsx`)
```tsx
// apps/web/src/components/ui/button.tsx
// Komponen ini tidak tahu apakah dia dipakai untuk Login atau Register.
// Dia hanya tahu cara menampilkan sebuah tombol yang indah.

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 ...",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)
```

**Komponen Fitur Spesifik** → `src/features/auth/components/` (contoh: `LoginForm.tsx`)
```tsx
// apps/web/src/features/auth/components/LoginForm.tsx
// Komponen ini SANGAT spesifik: hanya untuk halaman login.
// Ia tahu tentang validasi, API login, dan error handling.

export function LoginForm({ onRegisterClick }: { onRegisterClick?: () => void }) {
  // ... semua logika login ada di sini
}
```

---

## 3. JSX dan TSX: HTML di Dalam JavaScript

**JSX** = JavaScript + XML. Ini bukan HTML biasa, melainkan sintaks khusus yang nantinya dikompilasi oleh Vite/Babel menjadi JavaScript murni.

**TSX** = TypeScript + JSX (yang kita pakai di proyek ini).

### 3.1 Aturan-Aturan Wajib JSX

**Aturan 1: Harus ada satu elemen root**

```tsx
// ❌ SALAH - dua elemen sejajar tanpa pembungkus
return (
  <h1>Judul</h1>
  <p>Paragraf</p>
);

// ✅ BENAR - dibungkus satu div
return (
  <div>
    <h1>Judul</h1>
    <p>Paragraf</p>
  </div>
);

// ✅ LEBIH BAIK - pakai Fragment (<>) agar tidak menambah div ekstra di HTML
return (
  <>
    <h1>Judul</h1>
    <p>Paragraf</p>
  </>
);
```

**Aturan 2: Semua tag harus ditutup**

```tsx
// ❌ SALAH (cara HTML lama)
<input type="text">
<img src="foto.jpg">
<br>

// ✅ BENAR (JSX lebih ketat)
<input type="text" />
<img src="foto.jpg" />
<br />
```

**Aturan 3: `className` bukan `class`**

```tsx
// ❌ SALAH - 'class' adalah kata kunci JavaScript
<div class="container">

// ✅ BENAR - di JSX pakai 'className'
<div className="container">
```

**Aturan 4: Event handler menggunakan camelCase**

```tsx
// ❌ HTML biasa
<button onclick="klik()">

// ✅ JSX
<button onClick={() => klik()}>
```

### 3.2 Ekspresi JavaScript dalam JSX

Gunakan kurung kurawal `{}` untuk "memasukkan" JavaScript ke dalam JSX:

```tsx
function ProfilUser() {
  const nama = "Budi Santoso";
  const umur = 25;
  const sudahLogin = true;
  const daftarHobi = ["Membaca", "Coding", "Gaming"];

  return (
    <div>
      {/* Variabel langsung */}
      <h1>{nama}</h1>

      {/* Ekspresi matematika */}
      <p>Tahun lahir: {2024 - umur}</p>

      {/* Kondisi ternary (if-else singkat) */}
      {sudahLogin ? <span>Selamat datang!</span> : <span>Silakan login</span>}

      {/* Short-circuit: tampilkan hanya jika true */}
      {sudahLogin && <button>Logout</button>}

      {/* Loop dengan .map() untuk render list */}
      <ul>
        {daftarHobi.map((hobi, index) => (
          <li key={index}>{hobi}</li>  {/* 'key' wajib saat render list! */}
        ))}
      </ul>
    </div>
  );
}
```

### 3.3 Contoh Nyata dari Proyek SA-LMS

Di `LoginForm.tsx`, kita melihat penggunaan kondisi untuk menampilkan pesan error:

```tsx
// apps/web/src/features/auth/components/LoginForm.tsx (baris 56-60)

// Variabel 'error' berisi string pesan error, atau string kosong ''
// JavaScript menganggap string kosong sebagai "falsy" (tidak benar)
// Jadi: jika error ada isinya → tampilkan div merah; jika kosong → tidak tampil

{error && (
  <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 ...">
    {error}
  </div>
)}
```

Dan untuk render tombol dinamis berdasarkan state `isSubmitting`:

```tsx
// apps/web/src/features/auth/components/LoginForm.tsx (baris 114-121)

<Button
  type="submit"
  disabled={isSubmitting}  {/* Tombol di-disable otomatis saat loading */}
  className="w-full h-12 text-base font-semibold mt-4"
>
  {/* Jika sedang submit → tampilkan 'Signing in...', jika tidak → 'Sign in' */}
  {isSubmitting ? 'Signing in...' : 'Sign in'}
</Button>
```

---

## 4. React Hooks: Menambahkan "Kekuatan Super" ke Komponen

Hooks adalah fungsi-fungsi spesial React yang namanya selalu diawali kata `use`. Mereka memungkinkan kita menyimpan data, menjalankan efek samping, dll. **di dalam functional component**.

> ⚠️ **Aturan Wajib Hooks:**
> 1. Hanya boleh dipanggil di **tingkat paling atas** fungsi komponen (tidak boleh di dalam `if`, `for`, atau fungsi lain).
> 2. Hanya boleh dipanggil di dalam **React component** atau **custom hook** lain.

### 4.1 `useState` — Menyimpan "Ingatan" Komponen

Ini adalah hook paling fundamental. Setiap kali nilai state berubah, React akan **otomatis me-render ulang** komponen untuk menampilkan UI yang terbaru.

**Sintaks:**
```tsx
const [nilaiSekarang, fungsiUntahUbah] = useState(nilaiAwal);
```

**Contoh Detail:**
```tsx
import { useState } from 'react';

export function ContohState() {
  // useState mengembalikan array dengan 2 item:
  // [0] = nilai state saat ini
  // [1] = fungsi untuk mengubah nilainya
  const [nama, setNama] = useState('');       // string kosong = nilai awal
  const [umur, setUmur] = useState(0);        // angka 0 = nilai awal
  const [aktif, setAktif] = useState(false);  // false = nilai awal
  const [user, setUser] = useState<{ email: string } | null>(null); // null = belum ada user

  return (
    <div>
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)} // Update setiap ketik
        placeholder="Ketik namamu"
      />
      <p>Halo, {nama || 'Orang Asing'}!</p>

      <button onClick={() => setAktif(!aktif)}>
        {aktif ? 'Nonaktifkan' : 'Aktifkan'}
      </button>
    </div>
  );
}
```

**Contoh dari SA-LMS** — `LoginForm.tsx` menggunakan 2 state:

```tsx
// apps/web/src/features/auth/components/LoginForm.tsx

export function LoginForm({ onRegisterClick }: { onRegisterClick?: () => void }) {
  // State 1: Menyimpan pesan error (awal: string kosong = tidak ada error)
  const [error, setError] = useState('');

  // State 2: Menyimpan apakah password ditampilkan atau disembunyikan
  const [showPassword, setShowPassword] = useState(false);

  // ...
  return (
    // ...
    // Tombol mata: saat diklik, toggle antara true/false
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)} // ! = membalik nilai boolean
    >
      {showPassword
        ? <EyeOff className="h-5 w-5" />  // Jika true (terlihat) → tampilkan icon EyeOff
        : <Eye className="h-5 w-5" />     // Jika false (tersembunyi) → tampilkan icon Eye
      }
    </button>
  );
}
```

### 4.2 `useEffect` — Menjalankan Kode "Setelah Render"

`useEffect` digunakan untuk melakukan "efek samping": hal-hal yang terjadi di luar React, seperti memanggil API, subscribe ke event, atau mengubah judul halaman.

**Sintaks:**
```tsx
useEffect(() => {
  // Kode yang dijalankan setelah render

  return () => {
    // OPSIONAL: Cleanup (dijalankan sebelum komponen dihapus atau sebelum efek berikutnya)
  };
}, [dependensi]); // Array dependensi
```

**Kapan dijalankan — tergantung array dependensi:**

```tsx
// 1. Jalankan SETIAP kali komponen render ulang (biasanya dihindari)
useEffect(() => { console.log('Setiap render!'); });

// 2. Jalankan HANYA SEKALI saat komponen pertama kali muncul (mount)
useEffect(() => {
  console.log('Hanya sekali saat pertama muncul!');
  // Cocok untuk: ambil data awal, setup listener, dll.
}, []); // Array KOSONG = tidak ada dependensi = hanya sekali

// 3. Jalankan setiap kali 'userId' berubah
useEffect(() => {
  console.log('userId berubah menjadi:', userId);
  ambilDataUser(userId); // Ambil data user baru
}, [userId]); // Jalankan ulang kalau 'userId' berubah
```

**Contoh Praktis:**
```tsx
import { useState, useEffect } from 'react';

function TitleUpdater({ namaHalaman }: { namaHalaman: string }) {
  useEffect(() => {
    // Ubah judul tab browser setiap kali 'namaHalaman' berubah
    document.title = `SA-LMS | ${namaHalaman}`;

    // Cleanup: kembalikan judul saat komponen dihapus
    return () => {
      document.title = 'SA-LMS';
    };
  }, [namaHalaman]); // Bergantung pada 'namaHalaman'

  return null; // Komponen ini tidak render apapun, hanya untuk efek samping
}
```

> 💡 **Catatan Penting:** Di proyek SA-LMS, kita **tidak menggunakan `useEffect` untuk fetch data dari API**. Sebagai gantinya, kita menggunakan **TanStack Query** yang lebih powerful. `useEffect` tetap berguna untuk hal non-fetch seperti mengubah judul halaman, setup interval timer, dll.

### 4.3 `useContext` — Membaca Data Global

Hook ini digunakan untuk membaca data dari "Context" (semacam variabel global). Akan dibahas lebih dalam di Bab 6.

```tsx
// Cara sederhana membaca context:
import { useContext } from 'react';
import { AuthContext } from '@/features/auth/context/AuthContext';

function Header() {
  const authData = useContext(AuthContext);
  return <div>Halo, {authData?.user?.email}</div>;
}
```

---

## 5. Vite: Build Tool yang Super Cepat

Dulu orang memakai **Create React App (CRA)** untuk scaffolding proyek React. Sekarang CRA sudah usang dan tidak dikembangkan lagi. **Vite** adalah penggantinya yang jauh lebih cepat.

### 5.1 Mengapa Vite Lebih Cepat?

CRA mengkompilasi **seluruh** kode sebelum server menyala (bisa makan waktu 30-60 detik di proyek besar).

Vite menggunakan **Native ES Modules** — browser modern sudah bisa membaca modul JavaScript secara langsung. Vite tidak perlu bundle semuanya, hanya transform file yang diminta saja. Hasilnya: **server menyala dalam < 1 detik!**

### 5.2 File Konfigurasi Vite

```ts
// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'      // Plugin untuk JSX/React
import tailwindcss from '@tailwindcss/vite'   // Plugin Tailwind CSS v4
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),       // Mengaktifkan JSX transform
    tailwindcss(), // Mengaktifkan Tailwind CSS
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias '@' = folder 'src/'
    },
  },
})
```

**Alias `@`** sangat penting! Berkat alias ini, kita bisa import dengan path yang bersih:
```tsx
// Tanpa alias (path relatif yang berantakan):
import { Button } from '../../../components/ui/button';

// Dengan alias @ (selalu dari root src, tidak peduli file ada di mana):
import { Button } from '@/components/ui/button';
```

### 5.3 Hot Module Replacement (HMR)

Saat kamu menyimpan file saat development, Vite hanya mengganti **modul yang berubah** di browser tanpa me-reload seluruh halaman. State komponen (misalnya isi formulir yang sudah diketik) pun tetap terjaga!

### 5.4 Entry Point Aplikasi

```tsx
// apps/web/src/main.tsx
// Ini adalah titik awal (entry point) dari seluruh aplikasi React

import { StrictMode } from 'react'         // Mode ketat React untuk deteksi bug
import { createRoot } from 'react-dom/client'  // API baru React 18+
import './index.css'                        // CSS Global (termasuk Tailwind)
import App from './App.tsx'                // Komponen root kita

// createRoot: Cara React 18+ untuk "memasang" React ke dalam DOM
// getElementById('root') mencari <div id="root"> di index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>  {/* Membungkus dengan StrictMode untuk pengembangan */}
    <App />     {/* Komponen root kita dipasang di sini */}
  </StrictMode>,
)
```

```html
<!-- apps/web/index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SA-LMS</title>
  </head>
  <body>
    <!-- React akan "memasang" dirinya ke dalam div ini -->
    <div id="root"></div>

    <!-- Vite yang akan mengurus bundling main.tsx ini -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 6. TypeScript di React: Kenapa Wajib?

TypeScript (TS) adalah JavaScript dengan "tipe data". Ia membantu kita menemukan bug **sebelum kode dijalankan** — langsung saat mengetik di editor.

### 6.1 Perbedaan Tanpa/Dengan TypeScript

```tsx
// ❌ JavaScript biasa (tidak ada TypeScript)
function kirimData(data) {
  // Apakah 'data' punya property 'email'? Tidak ada yang tahu sampai dijalankan!
  fetch('/api/login', { body: JSON.stringify(data) });
}

kirimData({ username: 'budi' }); // Oops! Seharusnya 'email', bukan 'username'
// Error baru ketahuan saat runtime (saat dijalankan user)
```

```tsx
// ✅ TypeScript (dengan tipe data)
interface LoginData {
  email: string;
  password: string;
}

function kirimData(data: LoginData) {
  fetch('/api/login', { body: JSON.stringify(data) });
}

kirimData({ username: 'budi' }); // 🔴 ERROR LANGSUNG DI EDITOR!
// "Argument of type '{ username: string; }' is not assignable to parameter of type 'LoginData'."
// Property 'email' is missing!
```

### 6.2 TypeScript di Proyek SA-LMS

**Tipe untuk Auth:**
```ts
// apps/web/src/features/auth/types/index.ts

// Interface mendefinisikan "bentuk" dari sebuah objek
export interface User {
  id: string;
  email: string;
  name?: string;   // '?' artinya opsional (boleh tidak ada)
  role: 'admin' | 'student' | 'guardian' | 'teacher'; // Union type: hanya boleh salah satu dari nilai ini
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthState {
  user: User | null;    // 'User | null' artinya bisa berisi User atau null
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Generic Type di useState:**
```tsx
// Kita bisa memberi "petunjuk" tipe ke useState dengan angle brackets <>
const [user, setUser] = useState<User | null>(null);
//                                ^^^^^^^^^^
//                                TypeScript tahu bahwa 'user' bisa User atau null
//                                Jika kita coba akses user.email tanpa cek null, TypeScript akan error!
```

---

## 7. Rangkuman Bab 1

| Konsep | Penjelasan Singkat | Contoh di SA-LMS |
|---|---|---|
| **Komponen** | Fungsi JS yang mengembalikan JSX | `LoginForm`, `Button`, `AuthProvider` |
| **Props** | Data yang dikirim dari parent ke child | `onRegisterClick` di `LoginForm` |
| **JSX/TSX** | HTML di dalam JS/TS | Semua file `.tsx` |
| **useState** | Menyimpan state komponen | `error`, `showPassword` di `LoginForm` |
| **useEffect** | Jalankan kode setelah render | Setup title halaman, dll. |
| **Vite** | Build tool super cepat | `vite.config.ts` |
| **TypeScript** | Tipe data untuk JS | `User`, `LoginCredentials` interfaces |

---

> 🚀 **Langkah Selanjutnya:** Sekarang kamu paham fondasi React. Di **Bab 2**, kita akan mempelajari bagaimana kita mengorganisir semua file dan folder agar proyek tetap rapi meski semakin besar.
