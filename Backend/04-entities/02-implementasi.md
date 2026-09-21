# 2. Implementasi Entities (Studi Kasus: Products)

Untuk produk, kita ingin memastikan aplikasi (Service dan Controller) mengenali dengan persis seperti apa wujud objek Produk yang dikembalikan oleh Repository, khususnya jika nanti kita mem-filter beberapa kolom.

File: `packages/shared/src/entities/product.entity.ts`

```typescript
// INI WAJIB PAKAI import type
import type { Prisma } from '#generated/client';
import { productSelect } from '../selects/product.select';

// Tipe balikan untuk satu objek Produk
export type ProductEntity = Prisma.ProductsGetPayload<{
  select: typeof productSelect;
}>;

// Tipe balikan jika datanya berupa Array (untuk list)
export type ProductListEntity = ProductEntity[];
```

*(Catatan: `productSelect` merujuk ke materi di Bab 5).*

## Manfaat
Dengan memisahkan entitas ini, pada Bab 6 (Controller), kita akan menggunakan `ProductEntity` ini sebagai contoh dokumentasi Swagger, sehingga *Client* Frontend benar-benar tahu struktur data JSON yang akan mereka terima.
