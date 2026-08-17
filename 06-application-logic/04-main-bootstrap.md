# 4. Bootstrap Scalar API (main.ts)

Satu pertanyaan yang sering muncul: *"Jika dokumentasinya otomatis dari Zod, lalu di mana letak import Scalar-nya?"*

Jawabannya: **Scalar tidak di-import di Controller, melainkan di file *Bootstrap* utama aplikasi Anda.**

## Single Source of Truth
Di NestJS, `@nestjs/swagger` bertugas membangun kerangka dokumen (OpenAPI Specification) dari kode dan Zod DTO Anda. Nah, **Scalar** (`@scalar/nestjs-api-reference`) bertugas membaca kerangka tersebut dan merendernya menjadi UI modern yang interaktif, di satu titik mula, yakni `main.ts`.

## Contoh Implementasi (`apps/api/src/main.ts`)
Berikut adalah cara kita memasang Scalar di level *entry-point* aplikasi NestJS.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Membangun Dokumen OpenAPI (Swagger Spec) secara otomatis
  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('API Documentation untuk modul Products')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 2. Mengintegrasikan Scalar sebagai UI (Bukan RapiDoc/SwaggerUI)
  app.use(
    '/api',
    apiReference({
      theme: 'purple',
      spec: {
        content: document, // Melempar dokumen OpenAPI ke Scalar
      },
      hideDownloadButton: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

Dengan konfigurasi ini, seluruh Controller dan DTO Anda bebas dari keruwetan import terkait *rendering* dokumen. Anda cukup fokus menulis *Business Logic* dan biarkan Zod -> OpenAPI -> Scalar menangani sisanya!
