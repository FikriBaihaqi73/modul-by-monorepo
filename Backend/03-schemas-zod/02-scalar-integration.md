# 2. Integrasi Scalar (Single Source of Truth)

Salah satu hal paling keren di boilerplate ini adalah pendekatan **Single Source of Truth**. Daripada kita menduplikasi penulisan dokumentasi di *Controller* menggunakan banyak dekorator (seperti gaya lama Swagger), kita cukup menaruhnya di dalam skema **Zod**.

Dokumentasi API kita menggunakan **Scalar** yang lebih modern dan ringkas, dan Scalar membaca langsung deskripsi dari *schema* Zod Anda.

## Larangan Keras `@ApiProperty`
Sesuai aturan, Anda **DILARANG** menggunakan dekorator `@ApiProperty()` secara manual (satu per satu) di atas *class property*. Itu melanggar prinsip *Single Source of Truth*.

Sebagai gantinya, Anda **WAJIB** menggunakan fungsi `.describe("...")` langsung di setiap properti Zod Anda. `nestjs-zod` akan mengurai teks ini dan **Scalar** akan menampilkannya dengan rapi di dokumentasi API.

## Contoh Kode Implementasi Lengkap (Studi Kasus: Products)

Buat file `packages/shared/src/schemas/create-product.schema.ts`:

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// 1. Definisikan Zod Schema dengan Describe
export const CreateProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Nama produk minimal 3 karakter' })
    .describe('Nama lengkap dari produk (Harus unik).'), // <-- Scalar membaca ini!
    
  description: z
    .string()
    .optional()
    .describe('Deskripsi lengkap tentang produk.'), // <-- Scalar membaca ini!
    
  price: z
    .number()
    .positive({ message: 'Harga tidak boleh minus' })
    .describe('Harga jual produk dalam bentuk angka.'), // <-- Scalar membaca ini!
    
  stock: z
    .number()
    .int()
    .min(0, { message: 'Stok tidak boleh minus' })
    .describe('Jumlah stok saat ini (Bilangan bulat).'), // <-- Scalar membaca ini!
});

// 2. Eksport sebagai Class (DTO) agar dikenali NestJS
export class CreateProductDto extends createZodDto(CreateProductSchema) {}
```

## Update DTO (Partial)
NestJS Zod mempermudah kita membuat *schema* untuk *Update*. Kita cukup mengambil *Schema* dari Create, lalu menjadikannya `.partial()` (artinya semua *field* berubah menjadi opsional).

File: `packages/shared/src/schemas/update-product.schema.ts`
```typescript
import { createZodDto } from 'nestjs-zod';
import { CreateProductSchema } from './create-product.schema';

// Semua field menjadi opsional untuk proses PATCH/UPDATE
export const UpdateProductSchema = CreateProductSchema.partial();

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
```

Nantinya, kedua class DTO di atas (`CreateProductDto` dan `UpdateProductDto`) akan disuntikkan di parameter Controller (Bab 6), dan otomatis divalidasi serta terdokumentasi tanpa tambahan kode panjang!
