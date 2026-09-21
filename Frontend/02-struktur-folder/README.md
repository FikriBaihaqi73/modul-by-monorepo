# Bab 2: Struktur Folder Frontend (Feature-Sliced Design)

Ketika sebuah aplikasi web bertambah besar, meletakkan semua file di satu tempat akan membuatnya sangat berantakan (seperti mencari kaos kaki di lemari yang berantakan).

Oleh karena itu, di proyek ini kita menerapkan versi ringan dari pola arsitektur bernama **Feature-Sliced Design (FSD)**. Anda dapat menemukan kode utama di dalam folder `apps/web/src/`.

Berikut adalah pembedahannya:

## 1. `src/assets/`
Tempat menaruh file-file statis (gambar, ikon, logo) dan CSS Global (seperti `index.css`).

## 2. `src/components/` (Global Components)
Berisi komponen-komponen yang sifatnya **Umum / Universal** dan digunakan di seluruh bagian aplikasi.
- Di dalam folder ini biasanya ada folder `ui/` yang isinya tombol (`button.tsx`), input (`input.tsx`), dialog, dropdown, dll.
- Ingat: Komponen di sini tidak boleh tahu tentang logika bisnis (misalnya `button.tsx` tidak boleh berisi kodingan spesifik untuk login).

## 3. `src/features/` (Fitur-Fitur Aplikasi)
Ini adalah jantung dari pola FSD. Kita membagi aplikasi berdasarkan **Fitur Bisnis** (Domain). Misalnya, fitur otentikasi (login/register) ada di folder `auth`. Fitur materi ada di folder `materi`.

Struktur di dalam satu fitur (misal: `src/features/auth/`) biasanya seperti ini:
- `api/`: Berisi fungsi-fungsi untuk memanggil backend (contoh: `login.ts`, `register.ts`).
- `components/`: Komponen spesifik untuk fitur ini (contoh: `LoginForm.tsx`, `RegisterForm.tsx`).
- `context/` atau `hooks/`: Penyimpan logika dan state khusus fitur ini (contoh: `AuthContext.tsx`).
- `types/`: (Opsional) Definisi TypeScript khusus fitur ini.

*Aturan Emas:* Fitur A tidak boleh seenaknya memanggil kode di dalam Folder Fitur B secara langsung untuk menghindari kode yang terlalu saling mengikat (spaghetti code).

## 4. `src/lib/` (Utilities/Alat Bantu)
Tempat meletakkan fungsi-fungsi utilitas kecil yang tidak berhubungan dengan tampilan UI.
- `api.ts`: Konfigurasi dasar untuk memanggil *fetch* dengan URL backend.
- `utils.ts`: Fungsi-fungsi kecil pembantu (misal: penggabung *class* Tailwind).

## 5. `src/routes/` atau `src/pages/`
Jika proyek ini memakai sistem *routing* (seperti TanStack Router atau React Router), folder ini berisi komponen Halaman Utuh.
Halaman utuh biasanya tidak berisi logika rumit, melainkan hanya menyusun komponen-komponen dari folder `features` dan `components`.

**Mengapa struktur ini penting?**
Bagi pemula, ini mempermudah pencarian file. Jika ada error di fitur "Login", Anda tidak perlu mencari di seluruh lautan kodingan, cukup buka folder `features/auth/`. Selesai!
