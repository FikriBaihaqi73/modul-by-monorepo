# 2. Implementasi CRUD (Studi Kasus: Products)

Kita akan membuat `ProductRepository` di `packages/shared/src/infrastructure/repository/product.repository.ts`.
*(Kita memanggil *Prisma Selects* di sini, padahal Selects baru dibahas di Bab 5. Anda bisa mengabaikan `productSelect` sejenak).*

## Full Code: `product.repository.ts`

```typescript
import { PrismaClient } from '#generated/client';
import { productSelect } from '../selects/product.select';

export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // 1. Read All
  async findAll() {
    return this.prisma.products.findMany({
      select: productSelect,
      orderBy: { created_at: 'desc' }
    });
  }

  // 2. Read One by ID
  async findById(id: string) {
    return this.prisma.products.findUnique({
      where: { id },
      select: productSelect,
    });
  }

  // Helper untuk cek Duplikat Nama
  async findByName(name: string) {
    return this.prisma.products.findUnique({
      where: { name },
      select: { id: true } // Hanya butuh ID untuk ngecek existensi
    });
  }

  // 3. Create
  async create(data: { name: string; description?: string; price: number; stock: number }) {
    return this.prisma.products.create({
      data,
      select: productSelect,
    });
  }

  // 4. Update
  async update(id: string, data: { name?: string; description?: string; price?: number; stock?: number }) {
    return this.prisma.products.update({
      where: { id },
      data,
      select: productSelect,
    });
  }

  // 5. Delete
  async delete(id: string) {
    return this.prisma.products.delete({
      where: { id },
      select: productSelect,
    });
  }
}
```
Repository ini **hanya** berisi perintah database murni. Aturan bisnis (misal: "Jangan boleh buat barang kalau namanya sudah dipakai") akan kita letakkan di *Service* (Bab 6).
