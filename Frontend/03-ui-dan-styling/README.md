# Bab 3: Antarmuka & Gaya (UI & Styling)

Bagi pemula, menulis file CSS (`.css`) yang terpisah dari komponen HTML sangatlah merepotkan karena harus memikirkan penamaan class (seperti `class="btn-primary-besar"`). 
Di proyek ini, kita tidak melakukan itu!

## 1. Tailwind CSS v4
Kita menggunakan **Tailwind CSS**. Ini adalah *Utility-First CSS Framework*.
Artinya, kita memberikan gaya secara langsung di dalam JSX menggunakan class bawaan Tailwind.

**Contoh Klasik CSS:**
```css
.kotak {
  background-color: blue;
  padding: 16px;
  border-radius: 8px;
  color: white;
}
```
**Cara Tailwind CSS:**
```tsx
<div className="bg-blue-500 p-4 rounded-lg text-white">
  Saya adalah kotak
</div>
```
Tailwind versi 4 sangat cepat karena diintegrasikan langsung dengan Vite (melalui `@tailwindcss/vite`). Anda tidak perlu file `postcss.config.js` lagi.

### Keuntungan Tailwind:
- Anda tidak perlu memikirkan nama class yang aneh-aneh.
- Jika komponen dihapus, CSS-nya ikut terhapus (tidak meninggalkan *dead code*).
- Responsif sangat mudah (cukup tambah prefix `md:` atau `lg:`, misal `w-full md:w-1/2`).

## 2. Shadcn/UI (Komponen Siap Pakai)
Meskipun Tailwind itu hebat, membangun ulang tombol yang indah lengkap dengan animasi, atau membangun menu *dropdown* dari nol itu sangat memakan waktu.

Inilah mengapa kita menggunakan **Shadcn/UI**.
Shadcn/UI **bukanlah** pustaka (library) npm biasa (seperti Bootstrap atau Material UI) yang tinggal di-import, sehingga sulit dimodifikasi.

**Bagaimana Shadcn bekerja?**
Ketika kita membutuhkan tombol, Shadcn memberikan sebuah *script* yang akan **meng-copy** kode sumber `button.tsx` langsung ke dalam folder proyek kita (`src/components/ui/button.tsx`).
Karena kodenya ada di folder kita sendiri, kita memegang kendali 100%. Kita bebas merombak warnanya, bentuknya, atau ukurannya sesuai dengan desain aplikasi kita.

**Cara Penggunaan Shadcn (Contoh Input dan Tombol):**
```tsx
// Kita memanggil komponen UI lokal buatan Shadcn
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function FormSederhana() {
  return (
    <div className="flex gap-2">
      <Input placeholder="Masukkan nama..." />
      <Button variant="default">Kirim</Button>
    </div>
  )
}
```

### 3. Menggabungkan Class (clsx & tailwind-merge)
Di file `src/lib/utils.ts` Anda sering menemukan fungsi `cn()`.
Fungsi ini digunakan untuk menggabungkan class Tailwind dengan aman agar tidak bentrok.
Misal: `cn("bg-red-500", "bg-blue-500")` akan memastikan hanya satu warna *background* yang diterapkan tanpa masalah.
