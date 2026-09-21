# Bab 4: Form dan Validasi (React Hook Form & Zod)

Formulir (Form) adalah bagian paling rumit di Frontend. Kita harus membaca ketikan user, memastikan format email-nya benar, memastikan password-nya tidak kurang dari 8 karakter, menampilkan pesan error merah, dan men-disable tombol "Kirim" saat data sedang dikirim.

Melakukan ini secara manual (dengan banyak `useState` dan `if-else`) adalah mimpi buruk. Solusinya? **React Hook Form + Zod**.

## 1. Zod (Skema Validasi)
Zod adalah pustaka untuk mendeklarasikan *aturan* data (skema).
Kita menggunakan Zod untuk mendefinisikan bentuk data yang benar, lalu Zod akan mem-validasinya. Kehebatan Zod adalah ia juga langsung menghasilkan tipe (Type) TypeScript untuk kita!

Karena kita berada di arsitektur Monorepo, skema Zod (misalnya `RegisterSchema`) diletakkan di **Shared Package** (`@repo/shared/schemas/...`). Ini berarti Frontend dan Backend menggunakan aturan validasi yang 100% SAMA.

**Contoh Zod di Frontend:**
```tsx
import { z } from "zod";

// Skema yang diimpor dari folder Shared
const LoginSchema = z.object({
  email: z.email("Format email salah"),
  password: z.min(8, "Minimal 8 karakter")
});

// Zod ajaib: langsung membuat tipe TypeScript otomatis dari skema di atas
type LoginFormValues = z.infer<typeof LoginSchema>;
```

## 2. React Hook Form (Manajer Formulir)
Ini adalah pustaka standar industri untuk mengelola state form di React. Ia sangat ringan dan cepat karena tidak merender ulang seluruh komponen setiap kali kita mengetik 1 huruf di input (Uncontrolled Components).

**Cara Menggabungkan Zod dan React Hook Form:**
Kita menggunakan jembatan bernama `zodResolver`.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function ContohForm() {
  // Deklarasi form
  const { 
    register,      // Fungsi untuk mengaitkan Input HTML ke Hook Form
    handleSubmit,  // Fungsi yang dijalankan SAAT form disubmit dengan data yg sudah valid
    formState: { errors } // Berisi pesan error dari Zod jika data tidak valid
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema) // Pasang Zod di sini!
  });

  // Fungsi jika validasi Zod LOLOS
  const onSubmitValid = (data: LoginFormValues) => {
    console.log("Email yang valid:", data.email);
  }

  return (
    // onSubmit HTML ditangani oleh handleSubmit milik Hook Form
    <form onSubmit={handleSubmit(onSubmitValid)}>
      
      <label>Email</label>
      {/* Kaitkan input ini ke kolom "email" */}
      <input type="email" {...register('email')} />
      
      {/* Jika Zod mendeteksi error pada email, tampilkan pesan peringatannya */}
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <button type="submit">Masuk</button>
    </form>
  )
}
```

### Keuntungan Pendekatan Ini:
1. **SSOT (Single Source of Truth):** Frontend dan Backend memiliki standar validasi yang sama persis berkat Monorepo.
2. **Performa:** Ketikan di input sangat lancar tanpa *lag*.
3. **UX (User Experience):** Pesan error langsung muncul seketika pengguna melakukan kesalahan (tanpa harus menunggu respon dari server).
