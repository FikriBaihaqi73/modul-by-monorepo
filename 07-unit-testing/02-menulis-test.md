# 2. Menulis Test (Studi Kasus: Products Service)

Tahap terakhir, mari kita pastikan logika `ProductsService` kita tahan banting dengan *Unit Test*.

File: `apps/api/src/products/products.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductRepository } from '@repo/shared/infrastructure/repository/product.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    // 1. Setup Mock Repository (Semua method dari class ProductRepository)
    const mockRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(ProductRepository);
  });

  describe('createProduct', () => {
    const dto = { name: 'Kopi Susu', price: 20000, stock: 10 };

    it('Harus berhasil membuat produk baru (Happy Path)', async () => {
      // Mock: Belum ada produk dengan nama ini
      repository.findByName.mockResolvedValue(null);
      // Mock: Simulasi nilai balikan sukses
      repository.create.mockResolvedValue({ id: 'uuid-1', ...dto, created_at: new Date() } as any);

      const result = await service.createProduct(dto);

      expect(repository.findByName).toHaveBeenCalledWith(dto.name);
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result.id).toEqual('uuid-1');
    });

    it('Harus melempar ConflictException jika nama sudah ada (Negative Case)', async () => {
      // Mock: Nama sudah ada
      repository.findByName.mockResolvedValue({ id: 'uuid-exist' });

      // Service harus terputus dan melempar exception
      await expect(service.createProduct(dto)).rejects.toThrow(ConflictException);
      
      // Metode database .create() tidak boleh pernah dijalankan!
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    const updateDto = { name: 'Kopi Hitam' };

    it('Harus melempar NotFoundException jika produk tidak ada', async () => {
      // Mock ID tidak ketemu
      repository.findById.mockResolvedValue(null);

      await expect(service.updateProduct('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
      // Dipastikan batal update
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('Harus melempar ConflictException jika ganti ke nama yang sudah dipakai orang lain', async () => {
      // Produk asli ada
      repository.findById.mockResolvedValue({ id: 'id-1', name: 'Kopi Susu' } as any);
      // Tapi nama barunya sudah dipakai produk ID lain
      repository.findByName.mockResolvedValue({ id: 'id-2', name: 'Kopi Hitam' });

      await expect(service.updateProduct('id-1', updateDto)).rejects.toThrow(ConflictException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
```

Seperti yang Anda lihat, dengan Mocking, kita mampu mengendalikan kondisi database sesuai skenario yang ingin kita uji, sehingga bisa memverifikasi respon *Business Logic* NestJS di segala kondisi batas (Edge Cases).

Selamat! Anda kini telah menguasai satu siklus penuh pengerjaan fitur berdasarkan arsitektur **NestJS Monorepo Boilerplate**.
