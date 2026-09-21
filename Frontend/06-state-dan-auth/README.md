# Bab 6: State Management & Konteks Otentikasi (Context)

Dalam aplikasi React, pertukaran data secara normal berjalan dari "Orang Tua" (Parent) ke "Anak" (Child) menggunakan properti yang disebut **Props**.

Misalnya: Halaman Utama -> Memanggil Header -> Memanggil Tombol Profil.
Jika kita ingin tahu apakah pengguna sudah login, kita harus mengoper data status login ke bawah secara berantai. Jika kedalamannya mencapai 10 tingkat, ini sangat melelahkan! Kasus ini disebut *Prop Drilling*.

## 1. Solusi: React Context
**React Context** ibarat memancarkan sinyal radio. Anda memiliki "Pemancar" (Provider) di bagian paling atas aplikasi. Lalu, komponen manapun (biarpun sangat dalam lokasinya) yang memiliki "Radio Penerima" dapat mendengar data tersebut langsung tanpa perantara!

Inilah yang kita lakukan untuk menyimpan data *User Login* dan *Token* di aplikasi kita melalui fitur Otentikasi.

## 2. Implementasi AuthContext
Silakan lihat file `src/features/auth/context/AuthContext.tsx`.

Di sana kita membuat 3 bagian utama:
1. **State:** Menyimpan status (`isAuthenticated`) dan data profil (`user`).
2. **Pemancar (Provider):** Komponen bernama `<AuthProvider>` yang membungkus seluruh aplikasi React kita.
3. **Penerima (Custom Hook):** Fungsi pembantu `useAuth()` yang bisa dipanggil oleh komponen mana saja.

**Contoh Cara Kerjanya:**

```tsx
// 1. DI DALAM KOMPONEN HEADER (Cukup Pasang Penerima Sinyal)
import { useAuth } from '@/features/auth/hooks/useAuth';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth(); // Ajaib! Data ditarik dari Context

  return (
    <nav>
      {isAuthenticated ? (
        <div>
          Halo, {user.email}!
          <button onClick={logout}>Keluar</button>
        </div>
      ) : (
        <span>Silakan Login</span>
      )}
    </nav>
  )
}
```

## 3. Langkah Selanjutnya: TanStack Query (React Query)
Untuk State yang bersifat Global tetapi murni untuk mengambil dan menyimpan data dari API (Backend) secara otomatis (bukan sekadar login), modern Frontend jarang memakai Context manual.

Standar industrinya adalah menggunakan **TanStack Query** (dulu bernama React Query).
TanStack Query akan mengelola *loading*, menyimpan hasil API di dalam memori sementara (*cache*), dan melakukan pengulangan otomatis jika gagal. Ini akan dibahas pada fase pengembangan selanjutnya di proyek kita.

---
**PENUTUP MODUL FRONTEND:**
Kini Anda telah memahami dasar-dasar komponen, struktur FSD, styling dengan Tailwind, validasi Zod dengan form, serta cara aplikasi ini berkomunikasi. Silakan bereksperimen mengubah-ubah kode HTML di komponen yang sudah ada untuk melatih insting React Anda!
