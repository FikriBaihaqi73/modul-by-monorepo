# 1. Arsitektur Modular NestJS

Semua tahapan dari Bab 1 hingga Bab 5 sepenuhnya berada di paket `@repo/shared`. Langkah ke-6 ini adalah saat kita kembali ke ranah aplikasi utama kita, yaitu **NestJS** yang berada di `apps/[nama-app]/`.

## Pendekatan Module-Based
Setiap fitur (domain) dalam NestJS wajib dikelompokkan dalam satu **Module**. Anda tidak boleh menumpuk semuanya di dalam `app.module.ts`.

Sebagai contoh, jika Anda membangun fitur `Users`:
1. Buat folder `src/users/`.
2. Buat tiga komponen utama: Module, Service, dan Controller.

```text
apps/api/src/users/
├── users.module.ts
├── users.service.ts
└── users.controller.ts
```

## Memanggil Aset dari *Shared Package*
Di sinilah letak kekuatan sesungguhnya dari arsitektur *Monorepo* yang kita buat. Semua hal yang kita koding dengan susah payah dari Bab 2 sampai Bab 5 akan dipanggil ke sini.

Dalam NestJS, semua impor yang berasal dari *shared package* memakai `*Alias*` standar: `@repo/shared/*`.

Contoh:
```typescript
import { UserRepository } from '@repo/shared/infrastructure/repository/user.repository';
import { CreateUserDto } from '@repo/shared/schemas/create-user.schema';
import type { UserSafeEntity } from '@repo/shared/entities/user.entity';
```

*(Lanjut ke materi selanjutnya untuk melihat penerapan spesifik Service dan Controller)*
