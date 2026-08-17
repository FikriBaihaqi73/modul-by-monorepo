# 2. Pembuatan Model (Studi Kasus: Products)

Untuk membuat Anda lebih mudah belajar, mulai dari bab ini hingga bab terakhir kita akan menggunakan **Satu Studi Kasus Utuh**: Membuat fitur CRUD (Create, Read, Update, Delete) untuk entitas **Products**.

## Aturan Penamaan (Naming Conventions)
1. **Nama File**: jamak, huruf kecil (`products.prisma`).
2. **Nama Model**: PascalCase Jamak (`model Products`).
3. **Nama Kolom**: snake_case (`created_at`).

## Contoh Full: `products.prisma`
Buat file baru di `packages/shared/src/prisma/schema/products.prisma` dengan isi berikut:

```prisma
model Products {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(150)
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2) // Total 10 digit, 2 desimal
  stock       Int      @default(0) @db.Integer
  
  // Wajib ada di setiap tabel
  created_at  DateTime @default(now()) @db.Timestamp(6)
  updated_at  DateTime @updatedAt @db.Timestamp(6)

  // Map nama tabel fisik menjadi huruf kecil
  @@map("products")
}
```

Dalam skema di atas, kita menentukan bahwa:
- `id` menggunakan UUID.
- `name` bersifat unik (tidak boleh ada produk dengan nama yang sama).
- `description` opsional (bisa `null`).
- `price` menggunakan tipe Decimal untuk akurasi uang.
- `stock` memiliki nilai bawaan (default) 0.

Jangan lupa jalankan **`pnpm prisma:generate`** dan **`pnpm prisma:migrate`** (dibahas di halaman berikutnya) setelah membuat file ini!
