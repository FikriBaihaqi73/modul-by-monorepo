# 02. Global Configuration & Validation Pipe

Selain penyiapan Scalar UI, aplikasi NestJS pada `main.ts` disarankan menggunakan **Validation Pipe Global** agar semua data request yang masuk secara otomatis divalidasi oleh Zod DTO.

---

## 🛠️ Integrasi ZodValidationPipe Global

Dalam `@repo/shared` atau `nestjs-zod`, kita menggunakan `ZodValidationPipe` untuk melakukan penanganan kesalahan validasi secara otomatis.

```typescript
import { NestFactory } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan ZodValidationPipe secara Global
  app.useGlobalPipes(new ZodValidationPipe());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

---

## 📋 Ringkasan Penataan Aplikasi NestJS (`apps/api`)

1. **`01-modules/`**: Menyusun batas domain dan encapsulation aplikasi.
2. **`02-services/`**: Menangani aturan bisnis, pemanggilan Repository, dan error handling HTTP.
3. **`03-controllers/`**: Menangani rute HTTP dan memastikan format respons selalu terstandarisasi dengan `ResponseHelper`.
4. **`04-bootstrap-and-main/`**: Mengatur titik masuk aplikasi, CORS, Pipe validasi, dan UI Dokumentasi Scalar.
