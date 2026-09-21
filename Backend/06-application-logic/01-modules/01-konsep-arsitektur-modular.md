# 01. Konsep Arsitektur Modular NestJS

Dalam arsitektur monorepo backend kami (`apps/api`), aplikasi NestJS dibangun dengan pendekatan **Feature Module / Domain-Driven Modular**. Seluruh modul bisnis spesifik ditempatkan di dalam direktori `apps/api/src/`.

---

## 📁 Struktur Folder `apps/api/src/`

Setiap domain fitur aplikasi (misal: `user`, `products`, `auth`, `prisma`) berada dalam foldernya sendiri. Di dalam folder tersebut terdapat komponen pendukungnya seperti `Module`, `Controller`, dan `Service`.

```text
apps/api/src/
├── main.ts                     # Entry-point bootstrap aplikasi
├── app.module.ts               # Root module penggabung semua modul
├── app.controller.ts           # Root controller (health check)
├── app.service.ts              # Root service
├── prisma/                     # Global Database Provider Module
│   ├── prisma.module.ts        # Prisma Module (Global)
│   └── prisma.service.ts       # Prisma Service Wrapper
└── user/                       # Feature Module Domain: User
    ├── user.module.ts          # Encapsulation module untuk User
    ├── user.controller.ts      # HTTP Routes & Endpoint User
    ├── user.service.ts         # Business Logic User
    └── user.controller.spec.ts # Unit test untuk UserController/Service
```

---

## 🎯 Prinsip Utama Modularitas NestJS

1. **Encapsulation (Pengkapsulan)**:
   - Setiap folder domain bertanggung jawab penuh atas bisnis logiknya sendiri.
   - Provider atau Service yang dibutuhkan oleh modul lain wajib ditaruh di array `exports` pada `*.module.ts`.

2. **Inter-Module Dependency Injection**:
   - Jika `UserModule` membutuhkan akses database Prisma, `UserModule` akan mengimpor `PrismaModule` di array `imports`.

3. **Shared Package Integration (`@repo/shared`)**:
   - NestJS aplikasi mengimpor Repository, Schema Zod, DTO, dan Utilities dari `@repo/shared/*`.
   - Modul di `apps/api` bertindak sebagai penghubung antara HTTP Layer (Controller) dan Infrastructure Layer (Repository dari `@repo/shared`).
