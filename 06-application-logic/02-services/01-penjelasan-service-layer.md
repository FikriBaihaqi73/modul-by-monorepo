# 01. Penjelasan Service Layer (Business Logic)

**Service Layer** adalah jantung dari aplikasi NestJS. Di layer inilah semua **Business Logic**, validasi bisnis, konversi tipe data, dan error handling HTTP berada.

---

## 🎯 Peran Utama Service Layer

1. **Memanggil Repository dari Shared Package**:
   - Service menginisialisasi Repository dari `@repo/shared/infrastructure/repository/*`.
   - Menggunakan instance `PrismaClient` dari `PrismaService` lokal.

2. **Validasi Aturan Bisnis (Business Rules)**:
   - Memastikan data tidak duplikat sebelum insert/update (misal: cek `username` atau `email` unik).
   - Memastikan resource ada sebelum melakukan operasi `update` atau `delete`.

3. **Error Handling Terstruktur**:
   - Menglempar exception resmi dari `@nestjs/common` seperti:
     - `NotFoundException('Data tidak ditemukan')` -> HTTP 404
     - `ConflictException('Data sudah ada')` -> HTTP 409
     - `BadRequestException('Payload tidak valid')` -> HTTP 400

4. **Transformasi Tipe Data**:
   - Mengubah format ISO String timestamp dari DTO menjadi `Date` object JavaScript yang dibutuhkan oleh Prisma Client.
