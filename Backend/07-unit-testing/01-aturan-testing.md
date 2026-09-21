# 1. Aturan Wajib Unit Testing

Langkah terakhir dari seluruh rantai *Development Workflow* ini adalah menguji apa yang sudah kita kerjakan. Di arsitektur ini, **Unit Test bukan opsi, tapi keharusan**.

**Lokasi**: File test (*.spec.ts) diletakkan langsung berdampingan dengan file aslinya (misal: `user.service.ts` berdampingan dengan `user.service.spec.ts`).

## Tuntutan Pengujian (Testing Requirements)
Sebuah *Unit Test* dianggap belum memadai jika ia hanya menguji "Happy Path" (alur berhasil). Boilerplate ini menuntut standar industri:

1. **Happy Path**: Menguji alur sempurna jika data benar.
2. **Negative Scenarios**: Apa yang terjadi jika email sudah ada? Apa yang terjadi jika file tidak ditemukan?
3. **Edge Cases**: Apa yang terjadi jika variabel bernilai *null*, *undefined*, kosong `""`, atau *array empty* `[]`?
4. **Mocking External Dependencies**: Kita **dilarang keras** menembak langsung ke *database* di dalam *Unit Test*. Kita wajib mengelabui (*mock*) Repository agar merespons seperti yang kita mau (murni menguji *business logic* di Service-nya saja).

## Kenapa Repositories dan Services menjadi Fokus?
- *Controller* biasanya sangat tipis dan bisa diuji melalui *End-to-End (E2E) Test*.
- *Schemas* dan *Entities* divalidasi oleh kompiler TS dan Zod secara internal.
- **Service** adalah tempat di mana aturan bisnis berpusat (pengecekan, kalkulasi, dll), sehingga sangat fatal jika salah.
- **Repository** bisa diuji untuk memastikan query Prisma yang dihasilkan adalah benar.

Di pelajaran selanjutnya, kita akan melihat contoh penulisan *test case* yang nyata.
