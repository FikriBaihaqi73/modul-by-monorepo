# Bab 6: State Management & Konteks Otentikasi (React Context)

> 🎯 **Tujuan Bab Ini:** Memahami masalah "Prop Drilling", cara React Context menyelesaikannya, dan bagaimana seluruh sistem auth (AuthContext + AuthProvider + useAuth) bekerja di SA-LMS dari awal hingga akhir.

---

## 1. Masalah: Prop Drilling

Di React, data mengalir satu arah: dari **Parent** (orang tua) ke **Child** (anak) melalui **Props**.

### 1.1 Contoh Prop Drilling

Bayangkan kita punya struktur komponen seperti ini:

```
App
└── Dashboard
    ├── Navbar
    │   └── UserAvatar    ← Butuh data 'user'
    └── Sidebar
        └── UserMenu      ← Butuh data 'user'
```

Tanpa Context, kita harus mengoper data `user` ke bawah secara manual:

```tsx
// App.tsx
function App() {
  const [user, setUser] = useState<User | null>(null);

  return <Dashboard user={user} />;
  //                ↑ Kirim ke Dashboard...
}

// Dashboard.tsx
function Dashboard({ user }: { user: User | null }) {
  return (
    <>
      <Navbar user={user} />  {/* ...Lanjut ke Navbar... */}
      <Sidebar user={user} /> {/* ...dan Sidebar... */}
    </>
  );
}

// Navbar.tsx
function Navbar({ user }: { user: User | null }) {
  return <UserAvatar user={user} />;  {/* ...Lanjut ke UserAvatar... */}
}

// UserAvatar.tsx — Baru dipakai di sini!
function UserAvatar({ user }: { user: User | null }) {
  return <img src={user?.avatar} alt={user?.name} />;
}
```

`Dashboard` dan `Navbar` tidak benar-benar butuh `user`, mereka hanya jadi "perantara" yang mengopernya ke bawah. Ini disebut **Prop Drilling** — sangat melelahkan untuk dipelihara.

---

## 2. Solusi: React Context

React Context memungkinkan kita "menyiarkan" data dari satu tempat, dan komponen mana saja bisa "menangkap"-nya tanpa perlu dioper secara manual.

### 2.1 Analogi Radio

```
Prop Drilling:                React Context:
[App: user]                   [AuthProvider: user] ← "Pemancar Radio"
    ↓ props                          ↓
[Dashboard]                    (sinyal menyebar ke seluruh aplikasi)
    ↓ props                          ↓
[Navbar]                      [UserAvatar]    [UserMenu]   [AdminPanel]
    ↓ props                    useAuth()      useAuth()     useAuth()
[UserAvatar]                   ↑ "Penerima"   ↑ "Penerima"  ↑ "Penerima"
 ← Akhirnya dipakai!           Langsung ambil data, tanpa perantara!
```

---

## 3. Anatomi React Context di SA-LMS

Implementasi Context di SA-LMS terdiri dari 3 bagian yang saling terkait:

```
src/features/auth/
├── types/index.ts          ← 1. Definisi Tipe (User, AuthState, AuthContextType)
├── context/
│   └── AuthContext.tsx     ← 2. Context + Provider (Pemancar)
└── hooks/
    └── useAuth.ts          ← 3. Custom Hook (Penerima yang mudah dipakai)
```

### 3.1 Bagian 1: Tipe Data (Foundation)

```ts
// apps/web/src/features/auth/types/index.ts

// Tipe untuk data User dari backend
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'student' | 'guardian' | 'teacher';
}

// Tipe untuk credentials saat login
export interface LoginCredentials {
  email: string;
  password?: string;
}

// Tipe untuk keseluruhan state auth
export interface AuthState {
  user: User | null;       // null = belum login, User = sudah login
  isAuthenticated: boolean; // Singkatan: user !== null
  isLoading: boolean;       // true = sedang proses login/logout
}
```

### 3.2 Bagian 2: AuthContext.tsx — Inti Sistem Auth

```tsx
// apps/web/src/features/auth/context/AuthContext.tsx — PENJELASAN BARIS PER BARIS

import { createContext, useState, type ReactNode } from 'react';
import type { AuthState, LoginCredentials } from '../types';
import { loginApi } from '../api/login';

// ==============================
// LANGKAH 1: Definisikan "Bentuk" Context
// ==============================

// AuthContextType = AuthState + fungsi-fungsi yang bisa dipanggil
export interface AuthContextType extends AuthState {
  //                               ↑ 'extends' = mewarisi semua field dari AuthState
  //                                 (user, isAuthenticated, isLoading)
  login: (credentials: LoginCredentials) => Promise<void>;  // Async karena memanggil API
  logout: () => void;                                         // Sync karena hanya reset state
}

// ==============================
// LANGKAH 2: Buat Context Object
// ==============================

// createContext membuat "wadah" untuk data yang akan disiarkan
// <AuthContextType | undefined>: awalnya undefined (sebelum Provider memasang nilai)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
//                                                       ↑ undefined = belum ada Provider di atasnya


// ==============================
// LANGKAH 3: Buat Provider (Pemancar)
// ==============================

// children: ReactNode = semua komponen yang dibungkus oleh Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  // State internal milik Provider ini
  const [state, setState] = useState<AuthState>({
    user: null,             // Awalnya belum ada user
    isAuthenticated: false, // Awalnya belum terautentikasi
    isLoading: false,       // Awalnya tidak loading
  });

  // Fungsi login: async karena perlu menunggu respons API
  const login = async (credentials: LoginCredentials) => {
    // Set isLoading = true SEBELUM panggil API
    // setState dengan callback: prev = state sebelumnya
    setState((prev) => ({ ...prev, isLoading: true }));
    //         ↑ Spread operator: salin semua field lama, lalu timpa isLoading

    try {
      const user = await loginApi(credentials);  // Panggil API
      // Jika berhasil: update state dengan data user
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Jika gagal: kembalikan isLoading ke false, jangan ubah user/isAuthenticated
      setState((prev) => ({ ...prev, isLoading: false }));
      // Re-throw agar komponen yang memanggil bisa menangkap error ini
      throw error;
    }
  };

  // Fungsi logout: sync, cukup reset state ke kondisi awal
  const logout = () => {
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  // Render Provider dengan nilai yang ingin disiarkan
  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {/* value = data yang bisa diakses oleh semua komponen di dalam Provider */}
      {/* { ...state } = user, isAuthenticated, isLoading */}
      {/* login, logout = fungsi-fungsi yang juga tersedia */}
      {children}
    </AuthContext.Provider>
  );
}
```

### 3.3 Bagian 3: useAuth.ts — Custom Hook (Penerima)

```ts
// apps/web/src/features/auth/hooks/useAuth.ts

import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContext';

/**
 * Custom Hook untuk mengakses AuthContext
 *
 * Mengapa perlu custom hook ini? Bukan langsung useContext(AuthContext)?
 *
 * Alasan 1: Error message yang lebih jelas
 *   Tanpa custom hook: "Cannot read property 'user' of undefined"
 *   Dengan custom hook: "useAuth must be used within an AuthProvider"
 *
 * Alasan 2: Type Safety
 *   useContext(AuthContext) mengembalikan AuthContextType | undefined
 *   useAuth() mengembalikan AuthContextType (pasti ada, tidak undefined)
 *
 * Alasan 3: Lebih pendek dipakai
 *   Tanpa: const auth = useContext(AuthContext);
 *   Dengan: const auth = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  //              ↑ Membaca nilai dari AuthContext yang terdekat di atasnya

  // Guard: pastikan dipanggil di dalam AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context; // Kembalikan context yang sudah dipastikan bukan undefined
};
```

---

## 4. Cara Kerja Provider: Memahami `children` dan Tree Struktur

### 4.1 Membungkus Aplikasi dengan Provider

```tsx
// apps/web/src/App.tsx

import { AuthProvider } from '@/features/auth/context/AuthContext'

function App() {
  return (
    // AuthProvider membungkus SELURUH aplikasi
    // Semua komponen di dalam sini bisa akses data auth via useAuth()
    <AuthProvider>
      <main>
        <LoginForm />    {/* Bisa useAuth() */}
        <RegisterForm /> {/* Bisa useAuth() */}
      </main>
    </AuthProvider>
  )
}
```

**Visualisasi React Component Tree:**

```
<AuthProvider>                    ← Pemancar (provider)
│  state: { user: null, ... }
│  login(), logout()
│
└── <main>
    ├── <LoginForm>               ← Penerima: useAuth() → { login, isAuthenticated, ... }
    └── <RegisterForm>            ← Tidak pakai useAuth() untuk RegisterForm
```

### 4.2 Apa itu `children`?

```tsx
// Provider menerima 'children' sebagai props
export function AuthProvider({ children }: { children: ReactNode }) {
  //                                ↑ ReactNode = apapun yang bisa di-render React
  //                                  (JSX, string, number, array, null, dll.)

  return (
    <AuthContext.Provider value={...}>
      {children}  {/* Render semua yang dibungkus Provider */}
    </AuthContext.Provider>
  );
}

// Saat dipakai:
<AuthProvider>
  <main>...</main>   {/* 'main' ini adalah 'children' dari AuthProvider */}
</AuthProvider>
```

---

## 5. Menggunakan Context di Komponen

### 5.1 Di `LoginForm.tsx` — Memanggil Fungsi Login

```tsx
// apps/web/src/features/auth/components/LoginForm.tsx (baris 22-42)

export function LoginForm({ onRegisterClick }: { onRegisterClick?: () => void }) {
  // 1. Akses fungsi login dari Context (tanpa prop drilling!)
  const { login } = useAuth();
  //      ↑ Destructure: ambil hanya fungsi 'login' dari context

  const [error, setError] = useState('');

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError('');

      // 2. Panggil fungsi login dari Context
      // Ini akan: panggil loginApi → update state di AuthContext → isAuthenticated = true
      await login(data);

      // 3. TODO: Redirect ke dashboard setelah login
      // (Akan menggunakan TanStack Router di fase berikutnya)

    } catch {
      // 4. Jika login gagal (password salah, dll.)
      // Error asli di-rethrow dari AuthContext.login()
      setError('Invalid credentials or login failed');
    }
  };

  // ...
}
```

### 5.2 Di Komponen Mana Saja — Membaca Data Auth

```tsx
// Contoh: Navbar yang belum ada di proyek, tapi ini cara kerjanya nanti

import { useAuth } from '@/features/auth/hooks/useAuth';

function Navbar() {
  // Ambil semua yang diperlukan dari context
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <nav>
      {isAuthenticated ? (
        // User sudah login
        <div>
          <span>Halo, {user?.email}!</span>
          <span>Role: {user?.role}</span>
          <button onClick={logout}>Keluar</button>
        </div>
      ) : (
        // User belum login
        <a href="/login">Masuk</a>
      )}
    </nav>
  );
}
```

---

## 6. Memahami Update State yang Aman dengan Callback

Di `AuthContext.tsx`, kita menggunakan dua cara update state. Penting untuk memahami perbedaannya:

```tsx
// Cara 1: Update langsung dengan nilai baru
setState({
  user,
  isAuthenticated: true,
  isLoading: false,
});
// Aman jika kita mengganti SELURUH state

// Cara 2: Update dengan callback (gunakan ini jika hanya ubah SEBAGIAN state!)
setState((prev) => ({ ...prev, isLoading: true }));
//          ↑ 'prev' = state terkini saat fungsi ini dipanggil
//          { ...prev } = salin semua field lama (user, isAuthenticated, isLoading)
//          isLoading: true = timpa hanya field ini

// Mengapa callback lebih aman untuk update sebagian?
// React bisa "menggabungkan" beberapa setState sebelum render
// Jika kita langsung setState({ isLoading: true }), field user dan isAuthenticated akan HILANG!
// Dengan callback, prev selalu berisi nilai TERBARU meskipun ada batching

// ❌ BERBAHAYA (user dan isAuthenticated ikut ter-reset ke undefined!):
setState({ isLoading: true });

// ✅ AMAN (hanya isLoading yang berubah, sisanya tetap):
setState((prev) => ({ ...prev, isLoading: true }));
```

---

## 7. Mengapa Context dan Bukan State di App.tsx?

Pertanyaan bagus. Kenapa tidak simpan saja di `App.tsx`?

```tsx
// Cara naif: simpan di App.tsx lalu oper lewat props
function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Dashboard user={user} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
    // ↑ Harus dioper ke Dashboard, lalu ke Navbar, lalu ke UserMenu... (Prop Drilling!)
  );
}
```

**Masalahnya:**
1. **Prop Drilling** — setiap komponen perantara harus ikut menerima dan meneruskan props
2. **Coupling** — Dashboard sekarang "tahu" tentang auth, padahal seharusnya tidak perlu
3. **Maintainability** — saat kamu tambah komponen baru yang butuh auth, harus update semua rantai props

**Dengan Context:**
- Komponen manapun (seberapa dalam posisinya) bisa akses auth langsung dengan `useAuth()`
- Tidak ada coupling yang tidak perlu
- Mudah ditambah komponen baru

---

## 8. Langkah Selanjutnya: TanStack Query untuk Data Server

React Context cocok untuk state **UI global** yang jarang berubah (seperti auth status, tema, bahasa).

Tapi untuk **data dari server** (list kursus, data user, dll.), industri sudah beralih ke **TanStack Query (React Query)**. Alasannya:

| Fitur | Context Manual | TanStack Query |
|-------|----------------|----------------|
| Caching | ❌ Tidak ada | ✅ Otomatis |
| Re-fetch saat window fokus | ❌ Tidak ada | ✅ Otomatis |
| Loading & error state | 🔧 Manual | ✅ Otomatis |
| Retry saat gagal | ❌ Tidak ada | ✅ Otomatis |
| Invalidasi cache | ❌ Susah | ✅ Mudah |
| Deduplication (request yang sama tidak double) | ❌ Tidak ada | ✅ Otomatis |

**Preview TanStack Query** (akan diperdalam di modul berikutnya):

```tsx
import { useQuery } from '@tanstack/react-query';
import { getKursusApi } from '@/features/kursus/api/getKursus';

function DaftarKursus() {
  // useQuery mengelola loading, error, dan data otomatis
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['kursus'],        // Key unik untuk cache
    queryFn: getKursusApi,       // Fungsi yang memanggil API
    staleTime: 5 * 60 * 1000,   // Data dianggap segar selama 5 menit
  });

  if (isLoading) return <p>Memuat kursus...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map(kursus => (
        <li key={kursus.id}>{kursus.judul}</li>
      ))}
    </ul>
  );
}
```

Jauh lebih bersih dibanding `useEffect` + `useState` manual!

---

## 9. Rangkuman Alur Lengkap Auth di SA-LMS

```
1. main.tsx memasang App ke DOM
             ↓
2. App.tsx membungkus semua dengan <AuthProvider>
   AuthProvider:
   - Membuat state awal: { user: null, isAuthenticated: false, isLoading: false }
   - Menyediakan fungsi login() dan logout()
   - Menyiarkan semuanya via AuthContext.Provider
             ↓
3. User melihat <LoginForm>
             ↓
4. User isi email + password, klik "Sign in"
             ↓
5. React Hook Form memvalidasi dengan Zod
   - Gagal? → Tampilkan error di bawah field
   - Lolos? → Panggil onSubmit(data)
             ↓
6. onSubmit memanggil useAuth().login(data)
   (useAuth membaca fungsi 'login' dari AuthContext)
             ↓
7. AuthContext.login():
   - setState({ isLoading: true })
   - await loginApi(credentials)
             ↓
8. loginApi memanggil apiFetch('/auth/login', { method: 'POST', body: ... })
             ↓
9. Browser mengirim HTTP POST ke NestJS backend
             ↓
10. Backend memvalidasi, query database, kembalikan JSON:
    { status: 'success', data: { user: {...}, token: '...' } }
             ↓
11. apiFetch menerima respons, parse JSON, return response
             ↓
12. loginApi return response.data.user (objek User)
             ↓
13. AuthContext.login() menerima User:
    - setState({ user, isAuthenticated: true, isLoading: false })
             ↓
14. React mendeteksi state berubah → render ulang semua komponen
    yang menggunakan AuthContext (via useAuth())
             ↓
15. Semua komponen yang pakai useAuth() mendapat data baru:
    { user: { id: '...', email: '...', role: 'student' },
      isAuthenticated: true, isLoading: false }
```

---

## 10. Rangkuman Bab 6

| Konsep | Fungsi | File di SA-LMS |
|--------|--------|----------------|
| `createContext()` | Membuat "wadah" context | `AuthContext.tsx` baris 10 |
| `Context.Provider` | Menyiarkan nilai ke semua child | `AuthContext.tsx` baris 38-42 |
| `useContext()` | Membaca nilai dari context | `useAuth.ts` baris 8 |
| `AuthProvider` | Komponen pembungkus + state manager | `AuthContext.tsx` baris 12-43 |
| `useAuth()` | Custom hook untuk akses auth dengan mudah | `useAuth.ts` |
| `children` | Komponen yang dibungkus Provider | Prop di `AuthProvider` |
| `setState(prev => ...)` | Update state sebagian dengan aman | `AuthContext.tsx` baris 20, 29 |

---

## 11. Penutup: Kamu Sudah Memahami Fondasi Frontend Modern!

Selamat 🎉 Kamu telah mempelajari seluruh fondasi yang dibutuhkan untuk membangun aplikasi frontend modern:

| Bab | Topik | Skill yang Didapat |
|-----|-------|-------------------|
| 1 | React & Ekosistem Dasar | JSX, useState, useEffect, Vite, TypeScript |
| 2 | Struktur Folder FSD | Organisasi kode yang scalable dan mudah dipelihara |
| 3 | UI & Styling | Tailwind CSS, shadcn/ui, cn(), ikon |
| 4 | Form & Validasi | React Hook Form, Zod, handling error |
| 5 | Integrasi API | Environment variables, apiFetch, async/await |
| 6 | State & Context | React Context, AuthProvider, custom hooks |

**Yang masih perlu dipelajari (fase berikutnya):**
- **TanStack Router** — Routing halaman yang type-safe
- **TanStack Query** — Manajemen data server yang powerful
- **Fitur-fitur bisnis** — Manajemen kursus, materi, profil, dll.
- **Optimasi** — Code splitting, lazy loading, performance
