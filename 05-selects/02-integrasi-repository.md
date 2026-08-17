# 2. Integrasi Selects (Studi Kasus: Products)

Untuk Entitas Products, kita akan menentukan kolom mana saja yang boleh keluar dari eksekusi kueri Prisma.

File: `packages/shared/src/selects/product.select.ts`

```typescript
import { Prisma } from '#generated/client';

export const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  created_at: true,
  updated_at: true,
  // Kita keluarkan semua karena untuk Products kebetulan tidak ada data sensitif.
  // Tapi dengan mendeklarasikannya di sini, struktur kita menjadi kokoh.
} satisfies Prisma.ProductsSelect;
```

Objek `productSelect` inilah yang telah kita *import* dan pasang di semua metode (`findMany`, `findUnique`, `create`, dll) di dalam **Bab 2 (Repository)** dan **Bab 4 (Entities)**. 

Kini seluruh rangkaian *Shared Package* kita untuk *Products* telah rampung! Mari melangkah ke aplikasi utama NestJS.
