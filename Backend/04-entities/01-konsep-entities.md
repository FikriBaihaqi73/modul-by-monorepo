# 1. Konsep Entities & Tipe Balikan

Tahap ke-4 dari *Layered Pattern* adalah membuat **Entities**. 

**Lokasi**: `packages/shared/src/entities/`

## Apa itu Entity?
Jika *Schema/DTO (Zod)* bertugas sebagai tipe untuk data yang **MASUK** (Input) ke sistem kita, maka *Entity* adalah tipe data untuk sesuatu yang **KELUAR** (Output) dari sistem kita menuju client.

*Entity* adalah kontrak tertulis mengenai bentuk objek final (atau sebagian dari objek tersebut).

## Kenapa Tidak Pakai Tipe Prisma Bawaan Saja?
Secara default, jika Anda punya tabel `Users`, Prisma akan membuat tipe `Prisma.Users`. Namun tipe itu mencerminkan 100% semua kolom yang ada di database, termasuk kolom-kolom sensitif atau internal (seperti `deleted_at`, `password_hash`, dsb).
Kita tidak ingin *Controller* mengekspos semuanya secara tidak sengaja ke respon HTTP. 

Oleh karena itu, kita membatasi bentuk kembalian (*return type*) dan menamakannya sebagai *Entity* yang telah dibersihkan/dibatasi (seringkali berkorelasi erat dengan **Selects** yang akan dibahas di Bab 5).

## Aturan Penamaan
- Gunakan ekstensi `.entity.ts` (Contoh: `user.entity.ts`).
- Menggunakan `type` daripada `class` (kecuali jika ada logika transformasi presentasi/getter setter khusus, yang mana jarang dibutuhkan jika kita murni memakai JSON).
