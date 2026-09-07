# 01. Penjelasan Controller Layer (HTTP Routing & Response)

**Controller** di NestJS bertindak sebagai **Entry Gate HTTP**. Controller menangani incoming HTTP Requests (`GET`, `POST`, `PATCH`, `DELETE`), mengekstrak parameter/body, memanggil Service, dan mengembalikan respons berformat standar.

---

## 🎯 Standard & Best Practices Controller

1. **Konsistensi Respons (`ResponseHelper`)**:
   - Semua endpoint WAJIB membungkus data balikan menggunakan `ResponseHelper.success(...)` dari `@repo/shared/http/response`.
   - Format JSON standar:
     ```json
     {
       "status": "success",
       "code": 200,
       "message": "Berhasil mengambil data",
       "data": { ... }
     }
     ```

2. **Dokumentasi Otomatis (Scalar & Zod SSOT)**:
   - Tidak perlu memakai dekorator `@ApiResponse` manual yang panjang.
   - Gunakan dekorator dasar `@ApiTags(...)` dan `@ApiOperation({ summary: '...' })` dari `@nestjs/swagger`.
   - Dokumentasi schema request/response akan di-generate otomatis oleh **Scalar UI** dari Zod DTO (`.describe()`).

3. **Validasi Request DTO**:
   - DTO yang di-pass ke `@Body()` atau `@Param()` menggunakan Zod DTO dari `@repo/shared/schemas/*`.
