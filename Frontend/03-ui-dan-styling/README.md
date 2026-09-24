# Bab 3: Antarmuka & Gaya (UI & Styling dengan Tailwind CSS + shadcn/ui)

> 🎯 **Tujuan Bab Ini:** Memahami cara membuat tampilan yang indah dan konsisten menggunakan Tailwind CSS v4 dan komponen shadcn/ui, persis seperti yang digunakan di proyek SA-LMS.

---

## 1. Masalah dengan CSS Biasa

Sebelum masuk ke Tailwind, mari pahami dulu mengapa kita tidak hanya pakai CSS biasa.

**Masalah 1: Konflik nama class**
```css
/* style.css */
.button { background: blue; }        /* Di komponen A */
.button { background: red; }         /* Di komponen B — siapa yang menang?? */
```

**Masalah 2: CSS yang tidak terpakai (dead code)**
```css
/* Komponen LoginForm dihapus, tapi class-nya masih ada di CSS */
.login-form-wrapper { ... }          /* Tidak ada yang pakai, tapi tidak ketahuan! */
.login-form-input { ... }
.login-form-button { ... }
```

**Masalah 3: Bolak-balik file**
```tsx
// LoginForm.tsx
<div className="login-form">
// Harus buka style.css untuk tahu tampilan aktualnya
```

---

## 2. Tailwind CSS: Utility-First CSS Framework

Tailwind membalik cara kerja CSS. Alih-alih membuat nama class kemudian mengisi propertinya, kita langsung menggunakan **class utilitas** yang sudah disediakan Tailwind.

### 2.1 Cara Kerja Dasar

Setiap class Tailwind = satu properti CSS:

| Class Tailwind | CSS yang Dihasilkan |
|----------------|---------------------|
| `bg-blue-500` | `background-color: rgb(59, 130, 246)` |
| `p-4` | `padding: 1rem` (16px) |
| `rounded-lg` | `border-radius: 0.5rem` (8px) |
| `text-white` | `color: rgb(255, 255, 255)` |
| `flex` | `display: flex` |
| `items-center` | `align-items: center` |
| `justify-between` | `justify-content: space-between` |
| `w-full` | `width: 100%` |
| `h-11` | `height: 2.75rem` (44px) |
| `text-sm` | `font-size: 0.875rem` (14px) |
| `font-semibold` | `font-weight: 600` |
| `border` | `border-width: 1px` |
| `shadow-xl` | `box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), ...` |

### 2.2 Perbandingan CSS vs Tailwind

```css
/* ❌ CSS Biasa */
.kartu-login {
  width: 100%;
  max-width: 28rem;      /* max-w-md */
  padding: 2rem;          /* p-8 */
  border-radius: 0.75rem; /* rounded-xl */
  background: white;      /* bg-white */
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); /* shadow-xl */
  border: 1px solid #e4e4e7; /* border border-zinc-200 */
}
```

```tsx
{/* ✅ Tailwind CSS — semua dalam satu baris className */}
<div className="w-full max-w-md p-8 rounded-xl bg-white shadow-xl border border-zinc-200">
```

### 2.3 Sistem Skala Tailwind

Tailwind memiliki sistem skala yang konsisten. Angka unit dasar = 4px (0.25rem):

```
p-1  = 4px    (0.25rem)
p-2  = 8px    (0.5rem)
p-3  = 12px   (0.75rem)
p-4  = 16px   (1rem)      ← Sering dipakai
p-6  = 24px   (1.5rem)
p-8  = 32px   (2rem)      ← Sering dipakai
p-12 = 48px   (3rem)
p-16 = 64px   (4rem)
```

**Ini berlaku untuk:** `p-` (padding), `m-` (margin), `w-` (width), `h-` (height), `gap-`, `space-`, dll.

### 2.4 Responsivitas dengan Tailwind

Tambahkan prefix breakpoint untuk responsivitas:

```tsx
{/* Mobile: full width, Tablet (md): setengah, Desktop (lg): sepertiga */}
<div className="w-full md:w-1/2 lg:w-1/3">
```

| Prefix | Ukuran Layar |
|--------|-------------|
| (tanpa prefix) | Semua ukuran (Mobile First) |
| `sm:` | ≥ 640px |
| `md:` | ≥ 768px (Tablet) |
| `lg:` | ≥ 1024px (Desktop) |
| `xl:` | ≥ 1280px |

### 2.5 Dark Mode dengan Tailwind

Tambahkan prefix `dark:` untuk style dark mode:

```tsx
{/* Light: bg putih, Dark: bg hitam */}
<div className="bg-white dark:bg-zinc-950">
  {/* Light: teks hitam, Dark: teks putih */}
  <p className="text-zinc-900 dark:text-zinc-50">Halo!</p>
</div>
```

**Contoh nyata dari SA-LMS** — `App.tsx`:
```tsx
<main className="
  min-h-screen        {/* Tinggi minimal = tinggi layar penuh */}
  bg-zinc-50          {/* Background abu-abu sangat terang (light mode) */}
  dark:bg-zinc-950    {/* Background hitam pekat (dark mode) */}
  flex                {/* Display flex */}
  flex-col            {/* Arah: vertikal */}
  justify-center      {/* Pusatkan vertikal */}
  items-center        {/* Pusatkan horizontal */}
">
```

### 2.6 Hover dan State Classes

```tsx
{/* Tombol yang berubah warna saat dihover */}
<button className="
  bg-zinc-900           {/* Background normal */}
  hover:bg-zinc-700     {/* Background saat hover (mouse di atasnya) */}
  text-white
  transition-colors     {/* Animasi smooth saat warna berubah */}
  duration-200          {/* Durasi animasi: 200ms */}
">
  Klik Saya
</button>
```

**Contoh dari SA-LMS** — `button.tsx`:
```tsx
// Style untuk variant "default":
"bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
//                                          ↑ /90 artinya opacity 90% saat hover
```

---

## 3. Kelas-Kelas Tailwind yang Sering Dipakai di SA-LMS

Mari kita pelajari class-class yang paling sering muncul di kode:

### 3.1 Layout dan Positioning

```tsx
{/* Flexbox */}
<div className="flex items-center justify-between gap-4">
  {/* flex: aktifkan flexbox */}
  {/* items-center: sejajarkan vertikal ke tengah */}
  {/* justify-between: pisahkan item ke kiri dan kanan */}
  {/* gap-4: jarak antar item = 16px */}
</div>

{/* Positioning untuk tombol mata (show/hide password) */}
{/* Dari LoginForm.tsx baris 90-106: */}
<div className="relative">          {/* Elemen induk harus relative */}
  <Input ... />
  <button
    className="
      absolute              {/* Posisi absolut terhadap induknya */}
      right-3               {/* 12px dari kanan */}
      top-1/2               {/* 50% dari atas */}
      -translate-y-1/2      {/* Geser ke atas 50% dari tingginya sendiri = benar-benar tengah */}
    "
  >
    <Eye />
  </button>
</div>
```

### 3.2 Typography (Teks)

```tsx
{/* Dari LoginForm.tsx: */}
<CardTitle className="text-3xl font-bold tracking-tight">
  {/* text-3xl: ukuran font 1.875rem (30px) */}
  {/* font-bold: tebal */}
  {/* tracking-tight: jarak antar huruf sedikit lebih rapat */}
  Welcome Back
</CardTitle>

<CardDescription className="text-base">
  {/* text-base: ukuran normal 1rem (16px) */}
  Enter your email...
</CardDescription>

<Label className="text-sm font-semibold">
  {/* text-sm: kecil 0.875rem (14px) */}
  {/* font-semibold: semi-bold (600) */}
  Email
</Label>
```

### 3.3 Warna dan Background

Tailwind menggunakan skala 50-950 untuk setiap warna:
```
zinc-50  ← Paling terang (hampir putih)
zinc-100
zinc-200
zinc-300
zinc-400
zinc-500 ← Tengah
zinc-600
zinc-700
zinc-800
zinc-900
zinc-950 ← Paling gelap (hampir hitam)
```

```tsx
{/* Pesan error dari LoginForm.tsx baris 56-60 */}
<div className="
  bg-red-50          {/* Background merah sangat pucat */}
  border             {/* Ada border */}
  border-red-200     {/* Border merah muda */}
  text-red-600       {/* Teks merah tua */}
  rounded-md         {/* Sudut membulat medium */}
  p-4                {/* Padding 16px */}
  text-sm            {/* Ukuran teks kecil */}

  dark:bg-red-950/50      {/* Dark: background merah sangat gelap, opacity 50% */}
  dark:border-red-900/50  {/* Dark: border merah sangat gelap */}
  dark:text-red-400       {/* Dark: teks merah terang */}
">
  {error}
</div>
```

### 3.4 Borders dan Shadows

```tsx
{/* Card dari LoginForm.tsx baris 46 */}
<Card className="
  w-full              {/* Lebar 100% */}
  max-w-md            {/* Maksimal 28rem (448px) */}
  shadow-xl           {/* Bayangan besar */}
  border-zinc-200/80  {/* Border abu-abu dengan opacity 80% */}
  dark:border-zinc-800
">
```

---

## 4. shadcn/ui: Komponen Siap Pakai yang Bisa Dimodifikasi

### 4.1 Apa Bedanya dengan Library Biasa?

```
Library biasa (Bootstrap, MUI):          shadcn/ui:
┌─────────────────────────────┐         ┌─────────────────────────────┐
│ node_modules/               │         │ src/components/ui/          │
│   bootstrap/                │         │   button.tsx      ← MILIK   │
│     Button.tsx (tersembunyi)│         │   input.tsx       ← KITA!   │
│     ... (tidak bisa diubah) │         │   card.tsx                  │
└─────────────────────────────┘         └─────────────────────────────┘
Tidak bisa ubah kode internalnya        Bisa ubah apapun!
```

shadcn menggunakan `npx shadcn@latest add button` untuk **meng-copy** kode komponennya ke folder proyek kita. Kode tersebut menjadi **milik kita**.

### 4.2 Bedah Komponen `Button` di SA-LMS

```tsx
// apps/web/src/components/ui/button.tsx — PENJELASAN BARIS PER BARIS

import * as React from "react"
import { cn } from "@/lib/utils"   // Fungsi untuk menggabungkan class Tailwind

// 1. Interface: mendefinisikan props yang diterima Button
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  //       ↑ Mewarisi SEMUA props HTML button native (onClick, disabled, type, dll.)

  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

// 2. Objek yang memetakan variant ke class Tailwind-nya
const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900",
  destructive: "bg-red-500 text-zinc-50 shadow-sm hover:bg-red-500/90",
  outline: "border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100",
  secondary: "bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-100/80",
  ghost: "hover:bg-zinc-100 hover:text-zinc-900",
  link: "text-zinc-900 underline-offset-4 hover:underline",
}

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
}

// 3. React.forwardRef: memungkinkan komponen ini menerima 'ref' dari luar
//    (dibutuhkan saat parent ingin mengontrol DOM element langsung)
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    //  ↑ Destructure props
    //  className = class tambahan dari luar (boleh override)
    //  variant = jenis tampilan (default: "default")
    //  size = ukuran (default: "default")
    //  ...props = sisanya (onClick, disabled, children, type, dll.)
    //  ref = referensi ke DOM element (dari forwardRef)

    return (
      <button
        ref={ref}
        className={cn(
          // Class dasar yang SELALU ada di semua button:
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50",
          // Class berdasarkan variant yang dipilih:
          variantStyles[variant],
          // Class berdasarkan size yang dipilih:
          sizeStyles[size],
          // Class tambahan dari luar (bisa override class di atas):
          className
        )}
        {...props}  // Teruskan onClick, disabled, type, children, dll.
      />
    )
  }
)
Button.displayName = "Button"  // Nama untuk React DevTools
```

### 4.3 Cara Memakai Komponen shadcn/ui

```tsx
// Cara 1: Default (hitam)
<Button>Klik Saya</Button>

// Cara 2: Variant merah (untuk aksi berbahaya)
<Button variant="destructive">Hapus Akun</Button>

// Cara 3: Dengan border transparan
<Button variant="outline">Batal</Button>

// Cara 4: Besar + full width + disabled saat loading
<Button
  type="submit"
  disabled={isSubmitting}           // Dari react-hook-form
  className="w-full h-12 text-base font-semibold mt-4"  // Override size default
>
  {isSubmitting ? 'Signing in...' : 'Sign in'}
</Button>
```

### 4.4 Bedah Komponen `Card` di SA-LMS

`Card` terdiri dari beberapa sub-komponen:

```tsx
// apps/web/src/components/ui/card.tsx (versi aktual proyek)

// Card = kontainer utama (kotak)
// CardHeader = bagian atas (judul, deskripsi)
// CardContent = bagian isi utama
// CardTitle = judul besar
// CardDescription = teks kecil di bawah judul

import { cn } from "@/lib/utils"

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow",
      "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
      className
    )}
    {...props}
  />
)

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
    {...props}
  />
)

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)
```

**Cara memakainya** (persis seperti di `LoginForm.tsx`):
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

<Card className="w-full max-w-md shadow-xl border-zinc-200/80 dark:border-zinc-800">
  <CardHeader className="space-y-2 text-center pb-6">
    <CardTitle className="text-3xl font-bold tracking-tight">
      Welcome Back
    </CardTitle>
    <CardDescription className="text-base">
      Enter your email and password to sign in
    </CardDescription>
  </CardHeader>

  <CardContent className="px-8 pb-8">
    {/* Isi form ada di sini */}
  </CardContent>
</Card>
```

---

## 5. Fungsi `cn()` — Penggabung Class yang Cerdas

Fungsi ini berasal dari `src/lib/utils.ts` dan sangat penting:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Mengapa perlu `cn()` dan tidak pakai template literal biasa?**

```tsx
// ❌ Masalah dengan template literal biasa:
const className = `bg-red-500 ${kondisi ? 'bg-blue-500' : ''}`;
// Hasilnya: "bg-red-500 bg-blue-500"
// CSS tidak tahu mana yang prioritas → perilaku tidak terduga!

// ✅ Dengan cn() — tailwind-merge cerdas memilih yang terakhir:
const className = cn("bg-red-500", kondisi && "bg-blue-500");
// Hasilnya: "bg-blue-500" (konflik dihapus, yang terakhir menang)
```

**Kasus penggunaan nyata:**
```tsx
// Di Button: menggabungkan class dasar + variant + size + class dari luar
className={cn(
  "inline-flex items-center ...",  // class dasar (selalu ada)
  variantStyles[variant],           // class berdasarkan variant
  sizeStyles[size],                 // class berdasarkan size
  className                         // class dari props (bisa override semuanya)
)}

// Di Input: memungkinkan override dari luar tanpa konflik
className={cn(
  "flex h-9 w-full rounded-md border ...",  // class dasar input
  className   // misalnya "h-11" dari LoginForm akan override "h-9"
)}
```

---

## 6. Tailwind CSS v4: Cara Integrasi di Vite

Di proyek ini, Tailwind CSS v4 diintegrasikan langsung dengan Vite melalui plugin khusus:

```ts
// apps/web/vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← Cukup ini! Tidak perlu postcss.config.js
  ],
  // ...
})
```

```css
/* apps/web/src/index.css — Cukup import ini */
@import "tailwindcss";

/* Kustomisasi tambahan bisa ditambahkan di sini */
```

**Perbedaan Tailwind v3 vs v4:**
- v3: Perlu `tailwind.config.js`, perlu `postcss.config.js`, perlu list folder `content`
- v4: Cukup import `@import "tailwindcss"` di CSS, plugin Vite langsung scan otomatis

---

## 7. Ikon dengan `lucide-react`

Di proyek SA-LMS, kita menggunakan `lucide-react` untuk ikon:

```tsx
// Cara import ikon (persis seperti di LoginForm.tsx)
import { Eye, EyeOff } from 'lucide-react';

// Cara pakai — ikon bisa dikustomisasi seperti komponen React:
<Eye className="h-5 w-5" />     {/* h-5 w-5 = 20px × 20px */}
<EyeOff className="h-5 w-5" />

// Contoh penggunaan penuh di LoginForm.tsx:
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
>
  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
</button>
```

---

## 8. Rangkuman Bab 3

| Konsep | Kegunaan | Contoh |
|--------|----------|--------|
| **Tailwind CSS** | Styling langsung di JSX tanpa file CSS terpisah | `className="flex items-center p-4"` |
| **Dark Mode** | Prefix `dark:` untuk tampilan gelap | `dark:bg-zinc-950` |
| **Responsivitas** | Prefix `md:` `lg:` untuk tampilan berbeda per layar | `w-full md:w-1/2` |
| **shadcn/ui** | Komponen UI siap pakai yang bisa dimodifikasi | `<Button>`, `<Card>`, `<Input>` |
| **cn()** | Menggabungkan class Tailwind dengan aman | `cn("bg-red", kondisi && "bg-blue")` |
| **lucide-react** | Library ikon SVG | `<Eye className="h-5 w-5" />` |

---

> 🚀 **Langkah Selanjutnya:** Sekarang kamu bisa membuat UI yang cantik. Di **Bab 4**, kita akan belajar cara membuat form yang proper — dengan validasi real-time, pesan error yang informatif, dan performa yang cepat menggunakan React Hook Form + Zod.
