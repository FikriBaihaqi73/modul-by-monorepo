# 1. Konsep Repository Pattern

*Repository Pattern* adalah pola desain (design pattern) yang berfungsi sebagai penengah antara aplikasi yang Anda buat dengan cara penyimpanan datanya.

Di dalam **NestJS Monorepo Boilerplate**, seluruh akses database ditempatkan pada `packages/shared/src/infrastructure/repository/`. 

## Mengapa Memisahkan Logika Database?
Di banyak framework MVC tradisional, developer sering kali menulis logika akses database langsung di dalam *Controller* atau *Service*. Ini berisiko membuat kode:
1. **Susah ditest**: Anda tidak bisa mengisolasi *Service* tanpa menghubungkannya ke database asli.
2. **Ketergantungan Kuat (Tightly Coupled)**: Jika besok-besok ada perubahan tabel, seluruh *Controller* harus diedit.
3. **Duplikasi Kode**: Jika fungsi "Cari User Berdasarkan Email" dibutuhkan di modul Auth dan modul Payment, maka tanpa disadari *query* yang sama akan ditulis berulang-ulang.

## Repository sebagai Solusi
Dengan menggunakan *Repository Pattern*, kita menyembunyikan *Prisma Client* ke balik satu file spesifik per tabel. Jika *Service* ingin mencari *User*, ia tinggal memanggil fungsi `this.userRepository.findByEmail(email)`. *Service* tidak peduli tabelnya bernama apa, atau kolom di databasenya apa; ia hanya peduli ia mendapat objek yang dia minta.

Hal ini krusial untuk memenuhi standar Boilerplate kita yang memisahkan aplikasi HTTP (NestJS) dan *Workers*. Dengan menaruh Repository di paket `shared`, aplikasi API maupun Workers dapat memanggil kode pengambilan data yang persis sama.
