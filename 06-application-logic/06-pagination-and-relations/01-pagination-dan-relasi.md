# 06. Pagination dan Relasi (Eager Loading)

Dalam pengembangan API berbasis NestJS dengan arsitektur modular, mengambil daftar data yang besar memerlukan dua teknik utama:
1. **Pagination**: Membatasi jumlah data yang ditampilkan per halaman untuk menjaga performa.
2. **Relasi (Eager Loading)**: Menampilkan data terkait secara utuh (sebagai objek), bukan hanya ID relasinya (misalnya mengambil `Role` beserta `RolePermission`-nya).

Berikut adalah panduan implementasinya dengan standar *Repository Pattern*, Prisma Client dari `#generated/client`, dan format *response* seragam menggunakan `ResponseHelper`.

---

## 1. Menampilkan Data Relasi (Eager Loading)

Secara default, Prisma tidak akan melakukan *join* atau menyertakan data relasi. Jika kita query `Role`, kita tidak akan otomatis mendapatkan data `rolePermissions`.
Untuk menyertakan data relasi sebagai object seutuhnya, gunakan fitur `include`.

### Contoh Implementasi di Repository/Service

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/shared/prisma/prisma.service';
// Import type yang benar sesuai panduan AGENTS.md
import type { Role } from '#generated/client'; 

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ❌ Kurang Tepat: Hanya mengambil data Role tanpa relasinya
  async findAllRolesWithoutRelations(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  // ✅ Tepat: Mengambil data Role beserta object rolePermissions
  async findAllRolesWithRelations() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: true, // Menyertakan relasi RolePermission
        profiles: {
          select: { // Menggunakan select untuk memfilter kolom tertentu
            id: true,
            userId: true
          }
        }
      }
    });
  }
}
```

Dengan `include: { rolePermissions: true }`, response JSON akan membentuk hirarki objek (bukan sekadar kumpulan ID).

---

## 2. Mengimplementasikan Pagination

Untuk melakukan pagination, kita menggunakan `take` (limit) dan `skip` (offset) pada Prisma. 

### Contoh Implementasi Lengkap (Pagination + Relasi + ResponseHelper)

Sesuai dengan standar `AGENTS.md`, response harus dikembalikan menggunakan `ResponseHelper` (atau sejenisnya) agar struktur `{ status, message, data, code }` tetap konsisten. Kita bisa menambahkan properti `meta` untuk pagination.

#### 1. Controller (`role.controller.ts`)

Di level Controller, kita mendefinisikan standar dokumentasi menggunakan Zod (di level DTO) dan `@ApiOperation` untuk Scalar.

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { ResponseHelper } from '@repo/shared/http/response';

@ApiTags('Roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Mendapatkan daftar Role dengan fitur pagination dan eager loading' })
  async getRoles(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const result = await this.roleService.getPaginatedRoles(pageNumber, limitNumber);

    // Menggunakan standar ResponseHelper
    return ResponseHelper.success({
      message: 'Berhasil mengambil data roles',
      data: result.data,
      meta: result.meta,
      code: 200,
    });
  }
}
```

#### 2. Service / Repository (`role.service.ts`)

Terapkan logika perhitungan `skip` berdasarkan `page` dan gabungkan dengan query relasi.

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@repo/shared/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaginatedRoles(page: number, limit: number) {
    // 1. Hitung jumlah data yang harus dilewati (skip)
    const skip = (page - 1) * limit;

    // 2. Ambil data dengan pagination dan relasi
    const data = await this.prisma.role.findMany({
      skip,
      take: limit,
      include: {
        rolePermissions: true // Menarik relasi RolePermission
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 3. Hitung metadata untuk pagination
    const totalData = await this.prisma.role.count();
    const totalPages = Math.ceil(totalData / limit);

    // 4. Return data dan metadata
    return {
      data,
      meta: {
        totalData,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    };
  }
}
```

### Kesimpulan
- Selalu gunakan **`include`** atau **`select`** pada query Prisma jika Frontend membutuhkan detail object relasi.
- Gunakan kombinasi **`skip`** dan **`take`** untuk mengontrol pagination demi efisiensi query ke database.
- Pastikan import Prisma Client menggunakan `#generated/client` dan kembalikan struktur response menggunakan standar `ResponseHelper` sesuai pedoman di `AGENTS.md`.
