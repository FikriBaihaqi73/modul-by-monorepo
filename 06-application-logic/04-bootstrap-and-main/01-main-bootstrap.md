# 01. Main Bootstrap & Scalar API Reference (`main.ts`)

File `main.ts` adalah titik awal (*entry-point*) berjalannya aplikasi NestJS. Di file ini, kita melakukan bootstrap aplikasi, mengatur middleware global, dan mengintegrasikan dokumentasi API interaktif menggunakan **Scalar API Reference**.

---

## 🚀 Kode Bootstrap (`apps/api/src/main.ts`)

```typescript
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Mengaktifkan CORS & Global Prefix jika diperlukan
  app.enableCors();
  app.setGlobalPrefix("api/v1", {
    exclude: ["api", "api-json"], // Pengecualian rute dokumentasi Scalar
  });

  // 2. Membangun Dokumen OpenAPI (Swagger Specification)
  const config = new DocumentBuilder()
    .setTitle("SA LMS Backend API")
    .setDescription("Dokumentasi API backend untuk SA LMS Platform")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 3. Mengintegrasikan Scalar UI di Endpoint /api
  app.use(
    "/api",
    apiReference({
      theme: "purple",
      spec: {
        content: document, // Mengumpankan OpenAPI Spec ke Scalar UI
      },
      hideDownloadButton: true,
    }),
  );

  // 4. Menyediakan OpenAPI Spec versi JSON murni di /api-json
  app.getHttpAdapter().get("/api-json", (_req, res) => {
    res.json(document);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap();
```

---

## 📌 Alur Kerja Dokumentasi Scalar

1. NestJS & Swagger membaca kueri Zod DTO dari controller dan menghasilkan metadata OpenAPI.
2. `apiReference` dari `@scalar/nestjs-api-reference` merender metadata tersebut di URL `http://localhost:3000/api`.
3. Frontend Developer dapat mengakses dokumentasi interaktif yang modern tanpa mengganggu kode Controller.
