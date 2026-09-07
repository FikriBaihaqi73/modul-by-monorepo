# 02. Implementasi Module NestJS

Berikut adalah panduan dan contoh pembuatan file `Module` pada NestJS.

---

## 1. Prisma Module (`apps/api/src/prisma/prisma.module.ts`)

`PrismaModule` bersifat `@Global()` sehingga `PrismaService` dapat diakses oleh modul mana saja tanpa perlu mengimpor `PrismaModule` berulang kali.

```typescript
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 2. Feature Module (`apps/api/src/user/user.module.ts`)

`UserModule` mendaftarkan `UserController` sebagai pengatur endpoint HTTP dan `UserService` sebagai penyedia logika bisnis.

```typescript
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Di-export jika modul lain membutuhkan UserService
})
export class UserModule {}
```

---

## 3. Root App Module (`apps/api/src/app.module.ts`)

`AppModule` menggabungkan seluruh modul fitur ke dalam satu aplikasi utama.

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
