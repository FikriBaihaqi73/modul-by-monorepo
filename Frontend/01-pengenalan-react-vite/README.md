# Bab 1: Pengenalan React & Ekosistem Dasar

Selamat datang di dunia Frontend Modern! Di proyek ini, kita menggunakan ekosistem berbasis **React**, **Vite**, dan **TypeScript**. Bab ini akan menjelaskan dasar-dasar mutlak yang harus Anda pahami sebelum melihat kode lainnya.

## 1. Apa itu React?
React adalah pustaka (library) JavaScript yang diciptakan oleh Facebook untuk membangun antarmuka pengguna (User Interface). 
Jika dulu kita membuat web dengan HTML, CSS, dan JS yang terpisah-pisah, di React kita menggabungkannya ke dalam konsep bernama **Komponen**.

### Komponen (Components)
Bayangkan komponen seperti kepingan blok Lego. Anda memiliki blok Tombol (Button), blok Formulir (Form), dan blok Kartu (Card). Anda bisa merangkai blok-blok ini menjadi satu Halaman utuh.
Sebuah komponen React pada dasarnya hanyalah sebuah fungsi JavaScript yang mengembalikan tampilan (HTML).

## 2. Mengenal Sintaks: JSX & TSX
Di React, kita menulis kode HTML *di dalam* file JavaScript. Ini disebut **JSX** (atau **TSX** jika memakai TypeScript).

```tsx
// Contoh sebuah Komponen TSX
export function Sapaan() {
  const nama = "Budi"; // Variabel JS
  
  return (
    // Ini adalah JSX (mirip HTML)
    <div>
      <h1>Halo, {nama}!</h1>
    </div>
  );
}
```
*Aturan Emas JSX:*
- Anda bisa memasukkan variabel atau logika JavaScript ke dalam tampilan HTML menggunakan kurung kurawal `{ }`.
- Anda menggunakan `className` (bukan `class`) untuk memberikan style CSS.

## 3. Interaktivitas: React Hooks (useState & useEffect)
Komponen statis itu membosankan. Untuk membuatnya interaktif (seperti tombol mata yang bisa memunculkan password), kita menggunakan **Hooks**. Dua hooks yang paling penting adalah:

### A. `useState` (Kondisi / State)
Digunakan untuk menyimpan "ingatan" dari sebuah komponen. Jika nilai `state` berubah, React akan otomatis menggambar ulang komponen tersebut.

```tsx
import { useState } from 'react';

export function TombolSuka() {
  // 'suka' adalah variabel penyimpan nilainya (awal: false)
  // 'setSuka' adalah fungsi untuk mengubah nilai tersebut
  const [suka, setSuka] = useState(false);

  return (
    <button onClick={() => setSuka(!suka)}>
      {suka ? "Saya Menyukai Ini ❤️" : "Suka 🤍"}
    </button>
  );
}
```

### B. `useEffect` (Efek Samping)
Digunakan ketika Anda ingin melakukan sesuatu **setelah** komponen selesai ditampilkan di layar. Misalnya: mengambil data dari backend (API) saat halaman pertama kali dibuka, atau mendengarkan event dari browser.

```tsx
import { useState, useEffect } from 'react';

export function AmbilData() {
  const [data, setData] = useState("");

  useEffect(() => {
    // Fungsi ini akan dipanggil SEKALI saja ketika halaman pertama kali dibuka
    fetch("https://api.contoh.com/data")
      .then(res => res.text())
      .then(hasil => setData(hasil));
  }, []); // Array kosong [] artinya "Hanya jalankan saat pertama kali muncul"

  return <p>Data dari server: {data}</p>;
}
```

## 4. Vite (Pengganti Create React App)
Dulu orang menggunakan Create React App untuk membuat proyek React. Sekarang kita menggunakan **Vite**. 
Vite adalah *build tool* yang super cepat. Ketika Anda menjalankan `pnpm dev`, server lokal langsung menyala seketika dan setiap kali Anda menyimpan file, browser akan memperbarui tampilannya tanpa harus *reload* penuh (fitur ini disebut HMR - Hot Module Replacement).

## 5. TypeScript
Proyek ini memakai TypeScript (akhiran file `.ts` atau `.tsx`). Ini adalah fitur yang memberikan peringatan error saat Anda salah mengetik tipe data. Misalnya, jika sebuah fungsi meminta Angka, tapi Anda memberi Teks, TypeScript akan langsung error sebelum kode dijalankan. Ini sangat membantu mencegah bug!
