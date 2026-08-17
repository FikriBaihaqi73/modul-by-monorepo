# 3. Penulisan Controllers (Studi Kasus: Products)

Langkah penutup dari sisi arsitektur HTTP adalah `ProductsController`. Di sini, kita akan memasang semua *route* HTTP (`@Get`, `@Post`, dll).

**Lokasi**: `apps/api/src/products/products.controller.ts`

Berkat **Scalar** dan **Single Source of Truth** di *Zod*, kita tidak perlu lagi memenuhi *Controller* dengan berbagai dekorator `@ApiResponse` atau contoh JSON manual yang panjang lebar. Dokumentasi API akan dihasilkan secara otomatis dan elegan karena ia membaca `.describe()` dari *Zod Schema* yang sudah kita buat di Bab 3.

```typescript
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
// Hanya import dekorator dasar jika benar-benar butuh grouping, selebihnya diurus oleh Zod/Scalar
import { ApiTags, ApiOperation } from '@nestjs/swagger'; 
import { ProductsService } from './products.service';
import { CreateProductDto } from '@repo/shared/schemas/create-product.schema';
import { UpdateProductDto } from '@repo/shared/schemas/update-product.schema';
import { ResponseHelper } from '@repo/shared/http/response';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua daftar produk' })
  async findAll() {
    const data = await this.productsService.findAllProducts();
    // PENTING: Wajib gunakan ResponseHelper untuk output yang konsisten
    return ResponseHelper.success(data, 'Berhasil mengambil daftar produk');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail satu produk' })
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findProductById(id);
    return ResponseHelper.success(data, 'Detail produk ditemukan');
  }

  @Post()
  @ApiOperation({ summary: 'Menambahkan produk baru' })
  // Validasi berjalan OTOMATIS karena DTO menggunakan Zod
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.createProduct(dto);
    return ResponseHelper.success(data, 'Produk berhasil dibuat', 201);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mengedit informasi produk' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.updateProduct(id, dto);
    return ResponseHelper.success(data, 'Produk berhasil diperbarui');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus produk dari sistem' })
  async remove(@Param('id') id: string) {
    const data = await this.productsService.deleteProduct(id);
    return ResponseHelper.success(data, 'Produk berhasil dihapus');
  }
}
```

Seperti yang Anda lihat, kodenya jauh lebih *clean*! *Controller* kembali ke fungsi aslinya sebagai pengatur rute data tanpa dibebani oleh hal-hal terkait dokumentasi yang *redundant*. Semua keajaiban dokumentasi diselesaikan di `Zod` dan di-*render* secara cantik oleh `Scalar`.
