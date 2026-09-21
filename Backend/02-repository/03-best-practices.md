# 3. Best Practices Repository

Dalam Boilerplate ini, kita wajib menaati beberapa *best practices* demi keamanan dan keterbacaan.

## 1. Hindari Mengembalikan Password
Repository sebaiknya tidak pernah membocorkan data rahasia seperti *password* atau *salt* ke atas (ke level Service/Controller) secara cuma-cuma, karena risiko terekspos ke klien via API sangat besar.

Jika ada fungsi `findByEmail`, pastikan ia sudah melempar data bersih, dengan menggunakan fitur Select Prisma (akan dibahas lebih lengkap di **Bab 5: Selects**).

```typescript
// Contoh menggunakan select (Nanti kita akan menaruh objek ini di tempat terpisah)
async findByEmailSafe(email: string) {
  return this.prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      first_name: true,
      // perhatikan password TIDAK dicantumkan (false by default)
    }
  });
}
```

Hanya dan HANYA untuk kebutuhan pengecekan login (Auth), Anda bisa membuat method khusus seperti `findByEmailForLogin(email)` yang boleh menarik semua field (termasuk *password*).

## 2. Parameter Berbentuk Objek
Jika method Anda menerima banyak argumen (lebih dari dua), gunakan struktur *Object* sebagai *parameter*.

**Buruk:**
```typescript
async updateProfile(id: string, address: string, phone: string, status: boolean) { ... }
```

**Benar:**
```typescript
async updateProfile(id: string, data: { address: string; phone: string; status: boolean }) { ... }
```
Menggunakan parameter objek akan mencegah Anda menempatkan argumen secara terbalik.

## 3. Transaction Support (Advanced)
Jika memungkinkan operasi kompleks yang memerlukan beberapa langkah sekaligus (misal insert Order dan insert Detail Order), pertimbangkan untuk menerima *instance* Prisma Transaction.

```typescript
import { Prisma, PrismaClient } from '#generated/client';

export class OrderRepository {
  // prisma bisa berupa PrismaClient biasa, atau Omit transaction client
  constructor(private readonly prisma: PrismaClient | Prisma.TransactionClient) {}
}
```
Dengan begitu, logika *transaction* yang berjalan di Service dapat meneruskan state transaksinya ke dalam Repository.
