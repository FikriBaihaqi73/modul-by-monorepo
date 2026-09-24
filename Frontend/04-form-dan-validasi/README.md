# Bab 4: Form dan Validasi (React Hook Form + Zod)

> 🎯 **Tujuan Bab Ini:** Memahami secara mendalam cara membuat form yang robust — mengelola input, memvalidasi data sebelum dikirim, dan menampilkan pesan error yang informatif. Semua menggunakan kode nyata dari `LoginForm.tsx` dan `RegisterForm.tsx` di SA-LMS.

---

## 1. Mengapa Form Itu Kompleks?

Bayangkan membuat form login "biasa" dengan `useState` manual:

```tsx
// ❌ Cara manual yang TIDAK EFISIEN
import { useState } from 'react';

function LoginFormManual() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Validasi manual yang verbose dan rawan salah
  const validate = () => {
    let valid = true;
    if (!email.includes('@')) {
      setEmailError('Format email salah');
      valid = false;
    }
    if (password.length < 8) {
      setPasswordError('Minimal 8 karakter');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // ... panggil API
    setIsSubmitting(false);
  };

  // Dan ini HANYA untuk 2 field! Bayangkan form register dengan 6 field...
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setEmailError(''); // Reset error saat user ketik
        }}
      />
      {emailError && <p>{emailError}</p>}
      {/* ... dst */}
    </form>
  );
}
```

Ini sudah sangat panjang untuk 2 field saja! Dengan React Hook Form + Zod, kita bisa melakukan hal yang sama dengan **jauh lebih bersih dan aman**.

---

## 2. Zod: Mendefinisikan "Kontrak" Data

**Zod** adalah library untuk mendefinisikan skema validasi data. Keistimewaannya: dari satu skema Zod, kita bisa mendapatkan:
1. **Aturan validasi** (email harus valid, password minimal 8 karakter, dll.)
2. **Tipe TypeScript** otomatis (tidak perlu tulis `interface` manual!)

### 2.1 Cara Membaca Sintaks Zod

```ts
import { z } from 'zod';

// z.object() = membuat skema untuk objek
const SkemaLogin = z.object({

  email: z.string()        // Harus berupa string
           .email()        // Dan harus berformat email valid
           .min(1, 'Email wajib diisi'),  // Dan tidak boleh kosong

  password: z.string()
              .min(8, 'Password minimal 8 karakter')
              .max(50, 'Password maksimal 50 karakter'),
});

// Mengekstrak tipe TypeScript dari skema Zod
// Hasilnya sama seperti: interface LoginData { email: string; password: string; }
type LoginData = z.infer<typeof SkemaLogin>;
//               ↑ "Infer" = simpulkan tipe dari skema
```

### 2.2 Metode-Metode Zod yang Sering Dipakai

```ts
z.string()               // Tipe string
z.string().min(1)        // String, minimal 1 karakter (tidak boleh kosong)
z.string().min(8, 'Minimal 8 karakter')  // Dengan pesan error kustom
z.string().max(100)      // Maksimal 100 karakter
z.string().email()       // Harus format email valid (xxx@yyy.zzz)
z.string().url()         // Harus format URL valid

z.number()               // Tipe angka
z.number().min(0)        // Minimal 0
z.number().positive()    // Harus angka positif

z.boolean()              // Tipe boolean

z.enum(['admin', 'student', 'teacher'])  // Hanya boleh salah satu dari nilai ini

z.string().optional()    // Boleh undefined (tidak ada)
z.string().nullable()    // Boleh null

z.object({ ... })        // Objek
z.array(z.string())      // Array of string
```

### 2.3 Skema di Proyek SA-LMS (Shared Package)

Di monorepo kita, skema Zod ada di `packages/shared` agar dipakai oleh Frontend DAN Backend:

```ts
// packages/shared/src/schemas/auth.schema.ts (perkiraan isi)
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid').min(1, 'Email wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Format email tidak valid').min(1, 'Email wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['student', 'instansi']),
  institutionName: z.string().optional(),
});
```

**Keuntungan SSOT (Single Source of Truth):**
- Backend memvalidasi dengan `RegisterSchema` yang sama
- Tidak mungkin frontend lolos validasi yang tidak lolos di backend
- Ubah aturan di satu tempat → otomatis berlaku di mana-mana

---

## 3. React Hook Form: Manajer Form yang Efisien

**React Hook Form (RHF)** adalah library manajemen form yang menggunakan konsep "Uncontrolled Components" — input tidak di-manage oleh React state, melainkan langsung oleh DOM. Ini membuatnya sangat cepat (tidak re-render saat mengetik).

### 3.1 Hook `useForm` — Fondasi Semuanya

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Generic type <LoginData> memberi tahu RHF bentuk datanya
const {
  register,       // Fungsi untuk mendaftarkan input ke RHF
  handleSubmit,   // Fungsi wrapper untuk submit (menjalankan validasi dulu)
  formState,      // Objek berisi status form (errors, isSubmitting, dll.)
  watch,          // Fungsi untuk "memantau" nilai field tertentu
  reset,          // Fungsi untuk mereset semua field ke nilai awal
  setValue,       // Fungsi untuk set nilai field secara programatik
  getValues,      // Fungsi untuk mengambil nilai semua field saat ini
} = useForm<LoginData>({
  resolver: zodResolver(LoginSchema),  // Hubungkan ke skema Zod
  defaultValues: {
    email: '',
    password: '',
  }
});
```

### 3.2 `register` — Mendaftarkan Input ke RHF

Ini adalah fungsi yang paling penting. Ia menghubungkan elemen `<input>` HTML ke sistem RHF.

```tsx
// Penggunaan biasa:
<input {...register('email')} />

// Apa yang dilakukan spread operator {...register('email')}?
// register() mengembalikan objek:
{
  name: 'email',           // Nama field
  ref: ...,                // Referensi ke DOM element (untuk focus saat error)
  onChange: ...,           // Handler saat nilai berubah
  onBlur: ...,             // Handler saat input kehilangan fokus (untuk validasi)
}

// Jadi ini equivalen dengan:
<input
  name="email"
  ref={emailRef}
  onChange={handleEmailChange}
  onBlur={handleEmailBlur}
/>
```

**Contoh nyata dari `LoginForm.tsx`:**
```tsx
{/* Baris 65-72 */}
<Input
  id="email"
  {...register('email')}    {/* Daftarkan ke RHF dengan nama 'email' */}
  type="email"
  placeholder="name@example.com"
  autoComplete="email"
  className="h-11"
/>

{/* Baris 91-98 */}
<Input
  id="password"
  {...register('password')}  {/* Daftarkan ke RHF dengan nama 'password' */}
  type={showPassword ? "text" : "password"}
  placeholder="••••••••"
  autoComplete="current-password"
  className="h-11 pr-10"
/>
```

### 3.3 `formState` — Status Form Saat Ini

```tsx
const { formState: { errors, isSubmitting, isDirty, isValid } } = useForm();

// errors: Objek berisi pesan error per field
// Struktur: { email: { message: "Format email salah" }, password: { message: "..." } }

// isSubmitting: boolean — true saat form sedang diproses (await di onSubmit)
// isDirty: boolean — true jika ada field yang sudah diubah dari nilai awal
// isValid: boolean — true jika semua field lolos validasi

// Cara menampilkan error per field:
{errors.email && (
  <p className="text-sm text-red-500">{errors.email.message}</p>
)}
```

**Contoh nyata dari `LoginForm.tsx`:**
```tsx
{/* Baris 26-32 */}
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<LoginFormValues>({
  resolver: zodResolver(LoginSchema),
});

{/* Baris 73-77 — Tampilkan error email */}
{errors.email && (
  <p className="text-sm text-red-500 font-medium">
    {errors.email.message}
  </p>
)}

{/* Baris 107-111 — Tampilkan error password */}
{errors.password && (
  <p className="text-sm text-red-500 font-medium">
    {errors.password.message}
  </p>
)}
```

### 3.4 `handleSubmit` — Wrapper Submit yang Aman

```tsx
// handleSubmit memastikan validasi LOLOS sebelum memanggil fungsi kita
<form onSubmit={handleSubmit(onSubmit)}>

// Jika validasi gagal:
// - handleSubmit TIDAK memanggil onSubmit
// - errors otomatis diisi dengan pesan dari Zod
// - Field yang error mendapat fokus otomatis

// Jika validasi berhasil:
// - handleSubmit memanggil onSubmit dengan data yang sudah bersih dan bertipe
const onSubmit = async (data: LoginFormValues) => {
  //                          ↑ TypeScript tahu persis bentuk 'data'
  //                            { email: string, password: string }
  console.log(data.email);    // ✅ TypeScript happy
  console.log(data.telefon);  // 🔴 Error! 'telefon' tidak ada di LoginFormValues
};
```

### 3.5 `watch` — Memantau Nilai Field Secara Real-time

Ini digunakan ketika tampilan harus berubah berdasarkan nilai field lain.

**Contoh nyata dari `RegisterForm.tsx`:**
```tsx
{/* Baris 38-47 */}
const {
  register,
  handleSubmit,
  watch,            // ← Tambahkan watch
  formState: { errors, isSubmitting },
} = useForm<RegisterFormValues>({
  resolver: zodResolver(FrontendRegisterSchema),
  defaultValues: {
    role: 'student',  // Nilai awal untuk role
  }
});

const selectedRole = watch('role');
// ↑ Setiap kali dropdown 'role' berubah, selectedRole ikut update
// Dan komponen yang menggunakan selectedRole akan render ulang

{/* Baris 172-188 — Tampilkan field nama instansi HANYA jika role = instansi */}
{selectedRole === 'instansi' && (
  <div className="space-y-2.5">
    <Label htmlFor="institutionName">Institution Name</Label>
    <Input
      id="institutionName"
      {...register('institutionName')}
      type="text"
      placeholder="Example Academy"
      className="h-11"
    />
    {errors.institutionName && (
      <p className="text-sm text-red-500 font-medium">
        {errors.institutionName.message}
      </p>
    )}
  </div>
)}
```

---

## 4. Menggabungkan Zod + React Hook Form: Panduan Langkah demi Langkah

### 4.1 Langkah 1 — Import yang Dibutuhkan

```tsx
// Di LoginForm.tsx
import { useForm } from 'react-hook-form';           // RHF
import { zodResolver } from '@hookform/resolvers/zod'; // Jembatan RHF ↔ Zod
import * as z from 'zod';                             // Zod
import { LoginSchema } from '@repo/shared/schemas/auth.schema'; // Skema dari shared
```

### 4.2 Langkah 2 — Buat Tipe dari Skema

```tsx
// Zod otomatis menghasilkan tipe TypeScript
type LoginFormValues = z.infer<typeof LoginSchema>;
// Hasilnya: { email: string; password: string; }
```

### 4.3 Langkah 3 — Inisialisasi useForm

```tsx
export function LoginForm({ onRegisterClick }: { onRegisterClick?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),  // Pasang Zod sebagai validator
  });
```

### 4.4 Langkah 4 — Fungsi Submit

```tsx
  const onSubmit = async (data: LoginFormValues) => {
    // 'data' di sini SUDAH PASTI valid (sudah lolos Zod)
    // 'data' bertipe: { email: string, password: string }
    try {
      setError('');           // Reset pesan error
      await login(data);      // Panggil fungsi login dari Context
    } catch {
      setError('Invalid credentials or login failed');
    }
  };
```

### 4.5 Langkah 5 — Sambungkan ke JSX

```tsx
  return (
    <form onSubmit={handleSubmit(onSubmit)}>  {/* handleSubmit validates first */}

      {/* Input Email */}
      <Input {...register('email')} type="email" />
      {errors.email && <p>{errors.email.message}</p>}

      {/* Input Password */}
      <Input {...register('password')} type="password" />
      {errors.password && <p>{errors.password.message}</p>}

      {/* Tombol Submit */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
```

---

## 5. Studi Kasus: RegisterForm yang Lebih Kompleks

`RegisterForm.tsx` memiliki fitur tambahan yang menarik untuk dipelajari:

### 5.1 Extend Skema dari Shared Package

```tsx
// apps/web/src/features/auth/components/RegisterForm.tsx (baris 20-25)

// Import skema dasar dari shared package
import { RegisterSchema } from '@repo/shared/schemas/auth.schema';

// Extend dengan field tambahan yang HANYA ada di frontend
// (confirmPassword tidak perlu dikirim ke backend)
const FrontendRegisterSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  // Fungsi validasi kustom: pastikan password dan confirmPassword sama
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],  // Error ditampilkan di field confirmPassword
  }
);

type RegisterFormValues = z.infer<typeof FrontendRegisterSchema>;
```

**Penjelasan `.refine()`:**
Zod `.refine()` memungkinkan kita membuat validasi kustom yang membutuhkan akses ke **seluruh objek** (bukan hanya satu field). Contohnya: "pastikan password A sama dengan password B".

### 5.2 Select Component dengan RHF

```tsx
{/* RegisterForm.tsx baris 91-103 */}
<Select
  id="role"
  {...register('role')}    {/* Sama seperti Input, tinggal spread register() */}
  className="h-11"
>
  <option value="student">Student</option>
  <option value="instansi">Instansi</option>
</Select>
{errors.role && (
  <p className="text-sm text-red-500 font-medium">{errors.role.message}</p>
)}
```

### 5.3 State Lokal di Samping React Hook Form

RHF mengelola state form (nilai input, error validasi, isSubmitting), tapi ada state yang di luar jangkauannya:

```tsx
// State yang DIKELOLA oleh React Hook Form (via useForm):
// - Nilai email, password, role, institutionName
// - Error validasi Zod per field
// - isSubmitting (true saat async onSubmit berjalan)

// State yang DIKELOLA secara MANUAL dengan useState:
const [error, setError] = useState('');           // Error dari API (bukan validasi form)
const [success, setSuccess] = useState('');        // Pesan sukses setelah register
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Error API (dari server) BERBEDA dengan error validasi:
// - Error validasi = "Format email salah" (sebelum submit, dari Zod)
// - Error API = "Email sudah terdaftar" (setelah submit, dari backend)
```

---

## 6. Alur Lengkap Saat User Submit Form

Berikut alur detail yang terjadi saat user menekan tombol "Sign in":

```
User klik tombol "Sign in"
         ↓
<form onSubmit={handleSubmit(onSubmit)}>
         ↓
handleSubmit() mengambil alih
         ↓
Zod memvalidasi data: loginSchema.parse(formData)
         ↓
    ┌────┴────┐
    │         │
  GAGAL     LOLOS
    │         │
    ↓         ↓
errors    onSubmit(data) dipanggil
diisi     isSubmitting = true
    │     Tombol di-disable
    │         ↓
    │     await login(data)  ← memanggil AuthContext
    │         ↓
    │     loginApi(data)  ← memanggil API
    │         ↓
    │     apiFetch('/auth/login', { method: 'POST', body: ... })
    │         ↓
    │       ┌─┴─┐
    │       │   │
    │    ERROR SUCCESS
    │       │   │
    │       ↓   ↓
    │    throw  setState({ user, isAuthenticated: true })
    │    error
    │       │
    │       ↓
    │    catch block di LoginForm
    │    setError('Invalid credentials...')
    │
    ↓
Form tetap tampil
errors.email / errors.password muncul di UI
```

---

## 7. Validasi Real-time vs On-Submit

React Hook Form mendukung dua mode validasi:

```tsx
useForm({
  resolver: zodResolver(LoginSchema),
  mode: 'onSubmit',   // Default: validasi hanya saat submit (hemat performa)
  // mode: 'onChange',   // Validasi setiap ketikan (real-time, lebih interaktif)
  // mode: 'onBlur',    // Validasi saat field kehilangan fokus
  // mode: 'onTouched', // Validasi saat field pertama kali disentuh lalu ditinggal
  // mode: 'all',        // Kombinasi onChange + onBlur
})
```

Di SA-LMS (LoginForm dan RegisterForm), mode default `onSubmit` digunakan. Artinya error hanya muncul setelah user mencoba submit. Ini adalah UX yang lebih ramah pemula.

---

## 8. Rangkuman Bab 4

| Konsep | Fungsi | Contoh |
|--------|--------|--------|
| `z.object({...})` | Definisi skema validasi | `z.object({ email: z.string().email() })` |
| `z.infer<typeof Schema>` | Buat tipe TypeScript dari skema | `type LoginData = z.infer<typeof LoginSchema>` |
| `.refine()` | Validasi kustom lintas field | Cek `password === confirmPassword` |
| `useForm({ resolver: zodResolver(Schema) })` | Inisialisasi form dengan Zod | Di `LoginForm` baris 30-32 |
| `register('namaField')` | Daftarkan input ke RHF | `{...register('email')}` |
| `handleSubmit(onSubmit)` | Submit hanya jika valid | `onSubmit={handleSubmit(onSubmit)}` |
| `errors.field.message` | Tampilkan pesan error | `{errors.email && <p>{errors.email.message}</p>}` |
| `isSubmitting` | Disable tombol saat loading | `disabled={isSubmitting}` |
| `watch('field')` | Pantau nilai field secara real-time | `const role = watch('role')` |

---

> 🚀 **Langkah Selanjutnya:** Form kita sudah bisa memvalidasi data sebelum dikirim. Di **Bab 5**, kita akan belajar cara mengirim data tersebut ke backend melalui HTTP — dan bagaimana menangani berbagai kemungkinan respons dari server.
