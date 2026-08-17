# 1. Pengantar Zod & Validasi DTO

Di langkah ke-3 ini, kita akan merancang validasi input, atau yang sering disebut sebagai **Data Transfer Object (DTO)**.

Boilerplate ini beralih dari `class-validator` (yang menggunakan *decorators*) menjadi menggunakan **Zod**. Zod menawarkan *schema validation* yang sangat *type-safe* dan modern. 

**Lokasi Penyimpanan**: Semua schema validasi Zod diletakkan di `packages/shared/src/schemas/`.

## Mengapa Ditaruh di Shared Package?
Kita meletakkan skema Zod di sini karena **bukan cuma backend** yang bisa menggunakannya. Melalui arsitektur Monorepo, *Frontend Developer* (bila berada dalam monorepo yang sama) dapat mengimpor skema Zod ini langsung ke aplikasi React/Vue mereka untuk keperluan form validation (misal memakai `react-hook-form` & `zodResolver`). Hal ini menghasilkan *Single Source of Truth* untuk urusan validasi.

## Aturan Penamaan
1. **Nama File**: Gunakan *kebab-case* dan akhiran `.schema.ts` (contoh: `create-user.schema.ts`, `update-product.schema.ts`).
2. **Nama Variabel Zod**: Gunakan *PascalCase* dengan akhiran Schema (contoh: `CreateUserSchema`).
3. **Nama Kelas DTO**: Gunakan *PascalCase* dengan akhiran Dto (contoh: `CreateUserDto`).

## Granular Errors (Pesan Error yang Detail)
Setiap validasi yang gagal (misal email salah format) akan secara otomatis diproses oleh NestJS dan mengembalikan format JSON yang memuat letak *field* mana yang salah:
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Format email tidak valid" }
  ]
}
```
*Catatan Keamanan*: Jika Anda sedang membuat modul `Login` atau `Auth`, **jangan gunakan pesan yang terlalu detail** (seperti "Email tidak ditemukan"). Cukup gunakan "Invalid credentials" (atau yang setara) untuk mencegah orang luar menebak-nebak email apa saja yang sudah terdaftar (*Enumeration Attack*).
