# 1. Pengantar Prisma & Multi-file Schema

Di dalam Boilerplate Backend NestJS ini, kita menggunakan **Prisma ORM** sebagai jembatan untuk berinteraksi dengan database. Semua urusan terkait struktur tabel database dipusatkan di dalam direktori *shared package*:
`packages/shared/src/prisma/schema/`

## Mengapa Multi-file Schema?
Secara default, Prisma menyimpan seluruh model database di dalam satu file besar (`schema.prisma`). Namun, untuk aplikasi skala enterprise, file tunggal ini bisa membengkak hingga ribuan baris, membuatnya sangat sulit untuk dikelola.

Mulai dari Prisma 5.15+, kita dapat memecah skema ini menjadi banyak file. Inilah mengapa boilerplate kita memisahkan konfigurasi utama dengan file model entitas.

## Struktur Folder Prisma
Strukturnya terlihat seperti ini:
```text
packages/shared/src/prisma/
├── schema.prisma           # Konfigurasi utama (datasource & generator)
└── schema/                 # Direktori penyimpanan model-model (satu file per entitas)
    ├── users.prisma
    └── products.prisma
```

## Aturan Konfigurasi Utama (`schema.prisma`)
File konfigurasi utama harus **sangat minimalis**. Boilerplate kita melarang penulisan `url` kredensial langsung ke dalam blok `datasource` di file ini, karena informasi koneksi akan di-_inject_ melalui *environment variables*.

Contoh isi `schema.prisma`:
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"] // Wajib diaktifkan untuk fitur multi-file
}

datasource db {
  provider = "postgresql" // atau mysql
  url      = env("DATABASE_URL")
}
```

Dengan arsitektur ini, seluruh kode (aplikasi utama, scheduler, atau worker) akan selalu merujuk pada struktur *database* yang sama tanpa harus menduplikasi skema.
