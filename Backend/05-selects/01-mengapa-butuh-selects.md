# 1. Mengapa Butuh Selects?

Tahap ke-5 dari 7 *Development Workflow* ini terdengar sederhana, tapi punya peran yang sangat masif dalam hal **Keamanan** dan **Performa**.

**Lokasi**: `packages/shared/src/selects/`

## 1. Bahaya Default Behavior Prisma
Bila Anda menggunakan *Prisma Client* tanpa secara eksplisit menyebutkan *field* apa saja yang diambil:
```typescript
const user = await prisma.users.findUnique({ where: { id: 1 } });
```
Prisma akan mengeksekusi `SELECT * FROM users`. Jika tabel Anda punya 20 kolom (termasuk kolom *password*, *token*, catatan internal, dsb), semuanya akan ditarik ke dalam memori aplikasi Node.js Anda.
Risikonya:
- **Keamanan**: Developer bisa saja tidak sengaja melakukan `return user;` ke API, menyebabkan seluruh rahasia terekspos.
- **Performa**: Membuang *bandwidth* database yang berharga untuk kolom teks/JSON yang panjang dan tak terpakai.

## 2. Solusi: Objek Konstan Prisma Selects
Daripada Anda menuliskannya berulang kali di setiap *Repository* (`select: { id: true, name: true }`), kita merapikannya ke dalam sebuah objek pusat (Single Source of Truth) yang ada di folder ini.

Dengan demikian, jika besok ada kolom baru bernama `profile_picture` yang perlu diekspos ke semua *endpoint*, Anda cukup mengeditnya **di satu file saja**, tanpa perlu membuka belasan *Repository*.
