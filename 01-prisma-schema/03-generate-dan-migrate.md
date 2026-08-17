# 3. Generate Client & Database Migration

Hanya menulis model di dalam `.prisma` belum membuat database Anda berubah atau kode Anda bisa mendeteksi tabel-tabel tersebut. Anda perlu menjalankan proses *Generate* dan *Migrate*.

Semua perintah ini dijalankan dari **Root Directory** proyek Anda.

## 1. Prisma Generate
Perintah ini membaca seluruh file `.prisma` yang telah Anda buat, kemudian menghasilkan (generate) kode TypeScript internal berupa `PrismaClient` yang memiliki informasi *type-safe* tentang tabel-tabel Anda.

**Perintah:**
```bash
pnpm prisma:generate
```
**Kapan dijalankan?**
Setiap kali Anda selesai memodifikasi, menambah, atau menghapus blok apa pun di dalam folder `prisma/schema/`. Tanpa menjalankan ini, Anda akan mendapat *error* TypeScript saat mencoba mengakses tabel baru.

## 2. Prisma Migrate
Perintah ini membandingkan skema Prisma Anda dengan keadaan struktur database *SQL* yang sedang berjalan, lalu membuat *script* SQL untuk memutakhirkan struktur tabel di database Anda sesungguhnya.

**Perintah:**
```bash
pnpm prisma:migrate
```
**Kapan dijalankan?**
Setelah Anda melakukan penambahan model baru, atau merubah relasi, dan Anda ingin perubahan itu diaplikasikan secara nyata (fisik) ke dalam server PostgreSQL/MySQL Anda.
Biasanya sistem akan meminta nama migrasi (misal: `add_users_table`).

---
> **Peringatan AI / Developer**: Sebelum melanjutkan ke Tahap 2 (Repository), Anda **DIWAJIBKAN** memeriksa dan membaca struktur data yang ada, lalu menjalankan kedua perintah ini untuk memastikan bahwa *Prisma Client* sudah tersinkronisasi dan siap dipakai dalam logika pemrograman di tahap selanjutnya.
