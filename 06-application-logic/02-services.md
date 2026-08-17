# 2. Penulisan Service (Studi Kasus: Products)

Kita beralih ke direktori aplikasi NestJS, tepatnya di fitur Produk.
**Lokasi**: `apps/api/src/products/products.service.ts`

Di file *Service* ini, kita menggabungkan `ProductRepository` dari *shared package* dan menambahkan **Business Logic** (seperti pengecekan duplikasi nama dan pengecekan keberadaan ID saat mau Edit/Delete).

```typescript
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@repo/shared/infrastructure/repository/product.repository';
import { CreateProductDto } from '@repo/shared/schemas/create-product.schema';
import { UpdateProductDto } from '@repo/shared/schemas/update-product.schema';

@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAllProducts() {
    return this.productRepository.findAll();
  }

  async findProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    // Business Logic: Cek duplikat nama
    const existing = await this.productRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Produk dengan nama tersebut sudah ada');
    }
    
    return this.productRepository.create(dto);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    // 1. Cek produknya ada atau tidak
    await this.findProductById(id);

    // 2. Jika nama diubah, cek jangan sampai bentrok dengan produk lain
    if (dto.name) {
      const existing = await this.productRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException('Nama produk tersebut sudah dipakai produk lain');
      }
    }

    return this.productRepository.update(id, dto);
  }

  async deleteProduct(id: string) {
    // Cek produk ada atau tidak sebelum menghapus
    await this.findProductById(id);
    return this.productRepository.delete(id);
  }
}
```

Service ini sudah menutupi semua validasi *business rule* yang krusial sebelum data menyentuh database secara langsung.
