#set document(title: "Posts: NestJS API dan Frontend Next.js", author: "Shabrina Amalia")
#set page(paper: "a4", margin: 2.2cm, numbering: "1")
#set text(size: 10.5pt, lang: "id")
#set par(justify: true)
#set heading(numbering: "1.")
#show table: set par(justify: false)
#show raw.where(block: true): block.with(
  fill: luma(245), inset: 8pt, radius: 3pt, width: 100%,
)

#align(center)[
  #text(17pt, weight: "bold")[Client-side Rendering Using NestJS and Next.js]
  #v(2pt)
  PBKK A — Shabrina Amalia Safaana (5025241157)
]

= Outline Tugas

Aplikasi _posts_ (membuat post, membalas, mengedit, menghapus) di tugas ini
terdiri dari dua program terpisah. *Backend* NestJS di port 3000 hanya
mengirim data JSON. *Frontend* Next.js di port 3001 berjalan di browser dan
menyusun tampilan dari data tersebut.

Di awal tugas, kedua sisi belum tersambung. Controller backend belum punya
route sama sekali. Tiga halaman frontend (`index`, `posts/new`,
`posts/[id]`) hanya berpura-pura: datanya array `hardcodedPosts`, "loading"
dibuat dengan `setTimeout`, dan "menyimpan" hanya `console.log`. Hasilnya,
post baru tidak pernah benar-benar tersimpan, dan post yang dihapus muncul
lagi setelah halaman di-refresh.

Aplikasi yang sama sudah saya buat di h05 dengan template engine EJS. Itu
sebabnya, selain menyambungkan kedua sisi, saya juga menyamakan tampilan
frontend h06 dengan h05. Dengan begitu, hasil kedua pendekatan bisa
dibandingkan secara langsung di @compare: tampilannya sama, cara kerjanya
berbeda.

= Flow Pengerjaan

+ *Tetapkan kontrak API.* Untuk setiap endpoint, apa yang dikirim dan apa
  yang dikembalikan, termasuk status error.
+ *Kerjakan backend sampai selesai*, lalu uji dengan `curl` tanpa frontend.
+ *Sambungkan frontend halaman demi halaman*, meniru pola dari halaman yang
  sudah memanggil API (`edit.tsx` dan `reply.tsx`).
+ *Samakan tampilan dengan h05.*
+ *Verifikasi* seluruh alur di browser.

Frontend sepenuhnya bergantung pada backend. Kalau
keduanya dikerjakan bersamaan dan sebuah halaman kosong, sulit mengetahui
apakah masalahnya di `fetch`, di CORS, atau di query database. Dengan
menyelesaikan dan menguji backend lebih dulu, setiap masalah yang muncul
belakangan pasti ada di frontend. Ruang pencarian bug jadi jauh lebih kecil.

= Backend

== Kontrak API `backend/API.md` 

#table(
  columns: (auto, auto, 1fr),
  inset: 6pt,
  stroke: 0.5pt + luma(180),
  [*Method*], [*Endpoint*], [*Hasil*],
  [`GET`], [`/posts`], [Semua post, masing-masing dengan `replies`],
  [`POST`], [`/posts`], [Post baru. Jika ada `replyToId`, post itu menjadi reply],
  [`GET`], [`/posts/:id`], [Satu post beserta `replies`, atau 404],
  [`PUT`], [`/posts/:id`], [Post yang sudah diubah, atau 404],
  [`DELETE`], [`/posts/:id`], [Post yang dihapus, atau 404],
  [`GET`], [`/posts/:id/replies`], [Daftar reply post itu, atau 404],
)

Note: reply *bukan* tabel terpisah, melainkan adalah post biasa yang kolom `replyToId`-nya menunjuk ke post lain (relasi ke tabel sendiri). Akibatnya ada tiga:

- Membuat post dan membuat reply cukup satu endpoint, `POST /posts`.
  Bedanya hanya ada atau tidaknya `replyToId`.
- Reply juga bisa dibalas, sehingga terbentuk percakapan bertingkat.
- `GET /posts` mengembalikan *semua* baris, termasuk reply. Frontend yang
  harus memilih mana yang tampil sebagai post utama.

== Pembagian Service dan Controller

- *Service* adalah satu-satunya bagian yang berbicara dengan database.
  Di sini saya memutuskan *data apa yang ikut dikirim*. Setiap post
  langsung membawa daftar `replies`, supaya frontend tidak perlu request
  tambahan untuk setiap post. Untuk halaman detail, setiap reply juga
  membawa reply-nya sendiri, agar tampilan bisa menulis "1 more reply".
  Urutan data juga ditentukan di sini: post terbaru di atas, reply dari
  yang terlama agar terbaca seperti percakapan.
- *Controller* hanya menerjemahkan HTTP ke pemanggilan service. Validasi
  body tidak ditulis manual, karena `ValidationPipe` global sudah memeriksa
  request terhadap aturan di DTO (nama maksimal 100 karakter, isi wajib
  diisi, `replyToId` harus UUID).

== Strategi error

*Id tidak ditemukan.* Soal sudah menyediakan helper `findOrFail`. Helper ini
saya panggil di awal setiap route yang menerima `:id` (lihat, ubah, hapus,
daftar reply), jadi pengecekan "ada atau tidak" hanya ditulis di satu
tempat dan hasilnya selalu 404.

*Error dari database.* Misalnya membalas post yang sudah tidak ada
(_foreign key_ gagal), atau post terhapus tepat di antara pengecekan dan
aksi. Untuk ini saya memakai `handlePrismaError` yang sudah ada di proyek.
Fungsi ini mengubah kode error Prisma menjadi 400 atau 404. Tanpa itu,
kesalahan input dari pengguna akan terlihat seperti server rusak (500).

Menghapus post yang punya reply tidak perlu ditangani khusus. Skema sudah
mengatur `onDelete: Cascade`, jadi database sendiri yang menghapus
reply-nya.

== CORS

Frontend (`localhost:3001`) dan backend
(`localhost:3000`) berbeda port, sehingga browser menganggapnya dua
_origin_ yang berbeda. Request-nya tetap sampai ke server, tetapi browser
menahan respons dari JavaScript kecuali server menyatakan bahwa origin itu
diizinkan. Untuk `PUT`, `DELETE`, dan `POST` dengan JSON, browser bahkan
lebih dulu mengirim request "izin" (_preflight_ `OPTIONS`).

Karena yang declare aturan ini adalah browser, backend cukup
mengumumkan siapa yang diizinkan. Di `main.ts` saya mengaktifkan CORS hanya
untuk `http://localhost:3001` dan hanya untuk empat method yang dipakai.
Saya sengaja tidak memakai `*`, agar halaman web lain tidak bisa memakai
API ini dari browser pengunjungnya.

== Menguji backend sebelum ada frontend

Backend diuji dengan `curl` mengikuti alur nyata: membuat post, membalas,
mengambil post (memastikan reply ikut muncul), mengambil `/replies`,
mengedit, menghapus, lalu memastikan reply ikut terhapus. Setelah itu saya
menguji kasus gagal: keempat endpoint `:id` dengan id palsu harus 404, dan
reply ke post yang tidak ada harus 400.

Karena `curl` mengabaikan CORS, saya juga mengirim request _preflight_
dengan header `Origin: http://localhost:3001` dan memeriksa bahwa balasannya
berisi `Access-Control-Allow-Origin` yang benar. Setelah semua ini lolos,
backend saya anggap selesai.

= Frontend

== Pola yang saya tiru

Sebelum mengubah apa pun, saya mempelajari `edit.tsx` dan `reply.tsx` yang
sudah memanggil API. Keduanya punya pola yang sama, dan pola itu saya
terapkan ke semua halaman:

+ Halaman dimulai dalam keadaan *loading*.
+ Setelah halaman tampil, data diminta dengan `fetch`.
+ Respons diperiksa. Jika berhasil, data disimpan di state dan React
  menggambar ulang halaman. Jika gagal, tampilkan pesan atau arahkan
  pengguna kembali.

Ada dua jebakan yang saya jaga di setiap halaman, sesuai petunjuk soal:

- *`fetch` tidak menganggap 404 atau 500 sebagai kegagalan.* `fetch` hanya
  gagal jika jaringan putus. Karena itu setiap respons diperiksa dengan
  `response.ok`. Tanpa pemeriksaan ini, pesan error dari server akan
  ditampilkan seolah-olah itu sebuah post.
- *Id dari URL belum tersedia pada render pertama.* Next.js baru mengisi
  `router.query.id` setelah router siap. Halaman yang memakai id menunggu
  sampai id ada sebelum memanggil API. Kalau tidak, request pertama
  menuju `/posts/undefined`.

== Perubahan per halaman

*Daftar post (`index`).* Data palsu diganti dengan `GET /posts`. Karena
endpoint ini juga mengembalikan reply, halaman hanya menampilkan post yang
tidak punya `replyToId`. Reply tetap muncul, tetapi di bawah post induknya.
Setelah menghapus, saya *memuat ulang daftar dari server* alih-alih
menghapus item dari array di memori. Dengan begitu, yang tampil selalu sama
dengan isi database, termasuk reply yang ikut terhapus karena cascade.

*Membuat post (`posts/new`).* `setTimeout` dan `console.log` diganti dengan
`POST /posts`. Id dan waktu pembuatan tidak lagi dibuat di browser, karena
itu tanggung jawab database.

*Detail post (`posts/[id]`).* Post dan reply-nya diambil dalam satu
request, karena backend sudah menyertakan `replies`. Jika post yang dibuka
adalah reply, post induknya diambil dengan request kedua untuk teks
"Replying to ...". Saat pengguna berpindah dari satu post ke reply-nya,
Next.js memakai ulang komponen yang sama. Karena itu data post induk
dikosongkan setiap kali memuat, agar tidak tertinggal dari post sebelumnya.
Setelah menghapus, pengguna dikembalikan ke post induk (jika yang dihapus
adalah reply) atau ke daftar.

== Menyamakan tampilan dengan h05

Frontend bawaan memakai Bootstrap, sedangkan versi EJS saya di h05 memakai
desain sendiri: satu kolom, avatar berisi inisial, waktu relatif ("5m",
"3h"), dan tombol aksi berbentuk pill. Cara saya memindahkannya:

- *CSS dipindahkan apa adanya.* Seluruh gaya dari `layout.ejs` menjadi
  `styles/globals.css`, dan Bootstrap tidak dipakai lagi. Karena nama
  class-nya sama, markup React tinggal memakai class yang sama dengan
  template EJS.
- *Fungsi tampilan dipakai ulang.* `timeAgo`, `fullDate`, `initial`, dan
  `avatarColor` disalin ke `lib/view-helpers.ts`. Di h05, fungsi ini
  dipasang ke semua view lewat middleware. Di h06, fungsi ini cukup
  di-import oleh komponen yang membutuhkannya.
- *Partial EJS menjadi komponen React.* `partials/post-form.ejs`, yang
  dipakai halaman new, edit, dan reply, menjadi komponen `PostForm`.
  Avatar dan waktu juga dijadikan komponen kecil karena muncul di hampir
  semua halaman.
- *Navigasi tanpa reload.* Link memakai `next/link`, sehingga berpindah
  halaman tidak memuat ulang seluruh dokumen.

== Verifikasi

Setelah semua perubahan, tidak ada lagi `hardcodedPosts`, `setTimeout`, atau
`console.log` di `frontend/pages/`, dan frontend lolos pemeriksaan tipe
TypeScript. Setiap halaman saya buka di Chrome dengan data uji (post, reply,
dan reply dari reply). Semuanya tampil sesuai desain h05, dan console browser
tidak menampilkan error CORS. Langkah terakhir adalah mencoba seluruh alur
dari `http://localhost:3001`: daftar → buat → lihat → reply → edit → hapus.

= EJS (E05) vs client-side rendering (E06) <compare>

== Perbedaan mendasar: di mana HTML dibuat

Dengan *EJS*, server mengambil data, mengisinya ke template, lalu mengirim
halaman HTML yang sudah jadi. Setiap aksi pengguna adalah request baru, dan
server menjawabnya dengan halaman baru atau redirect. Satu program
mengurus data sekaligus tampilan.

Dengan *client-side rendering (React)*, server hanya mengirim data JSON.
Browser mengunduh JavaScript, dan JavaScript itulah yang meminta data dan
menyusun tampilan. Backend dan frontend menjadi dua program yang hanya
terhubung lewat kontrak API.

== Aplikasi yang sama, dibuat dua kali

Karena h05 dan h06 sekarang tampil sama persis, perbedaannya terlihat dari
bagaimana fitur yang sama dibuat:

- *Menghapus post.* Di h05, form HTML hanya bisa mengirim `GET` atau
  `POST`. Karena itu hapus dibuat sebagai `POST /posts/:id/delete`, dan
  setelahnya server me-redirect sehingga seluruh halaman dimuat ulang. Di
  h06, `fetch` bisa mengirim `DELETE` sungguhan, jadi API-nya bisa
  mengikuti REST, dan hanya daftar post yang diperbarui.
- *Halaman detail.* Di h05, satu handler mengambil post beserta induknya,
  lalu memanggil `render`. Selesai. Di h06, halaman yang sama butuh state
  loading, pengecekan `response.ok`, penantian `router.query.id`, dan
  request kedua untuk post induk.
- *Tanggal.* Di h05, `timeAgo` dan `fullDate` dijalankan di server, jadi
  jam yang tampil mengikuti zona waktu server. Di h06, fungsi yang sama
  berjalan di browser, sehingga jam mengikuti zona waktu pengguna.
- *Tampilan pertama.* Halaman h05 langsung berisi data begitu tiba di
  browser. Halaman h06 tampil "Loading..." dulu sampai `fetch` selesai.
- *CORS.* Tidak ada di h05 karena semuanya satu origin. Di h06, ini harus
  dipahami dan dikonfigurasi.

#table(
  columns: (auto, 1fr, 1fr),
  inset: 6pt,
  stroke: 0.5pt + luma(180),
  [*Aspek*], [*EJS (h05)*], [*React (h06)*],
  [HTML dibuat di], [Server], [Browser],
  [Yang dikirim server], [Halaman HTML utuh], [JSON],
  [Tampilan pertama], [Langsung berisi data], [Ada tahap loading],
  [Aksi pengguna], [Request baru + redirect/reload], [Hanya bagian yang berubah],
  [Method HTTP], [Terbatas `GET`/`POST` dari form], [Semua method (REST penuh)],
  [SEO / tanpa JavaScript], [Isi langsung terbaca], [Kosong sampai JS berjalan],
  [CORS], [Tidak perlu], [Harus dikonfigurasi],
  [Klien lain (mobile, dll.)], [Perlu API terpisah], [Bisa memakai API yang sama],
  [Pengujian], [Lewat halaman HTML], [API bisa diuji sendiri dengan `curl`],
  [Kerumitan kode], [Lebih sedikit], [Loading, error, dan state diurus di klien],
)

== Kesimpulan: mana yang lebih baik?

Untuk aplikasi seperti ini, saya memilih *client-side rendering dengan
React dan API terpisah*. Alasannya:

+ *Tanggung jawab terpisah dengan jelas.* Backend hanya mengurus data dan
  aturan, frontend hanya mengurus tampilan. Ini terbukti di tugas ini:
  backend bisa saya selesaikan dan uji lengkap sebelum satu baris frontend
  diubah. Seluruh tampilan juga bisa saya ganti dari Bootstrap ke desain
  h05 tanpa menyentuh logika backend sama sekali (selain menambah data
  reply bertingkat).
+ *API bisa dipakai ulang.* Aplikasi berbasis post jarang berhenti di satu
  website. Aplikasi mobile atau integrasi lain cukup memanggil endpoint yang
  sama. Di h05, logika yang sama terkunci di dalam handler yang mengembalikan
  HTML, sehingga harus ditulis ulang sebagai API.
+ *API lebih bersih dan interaksi lebih halus.* Frontend bisa memakai method
  HTTP yang sebenarnya (`PUT`, `DELETE`) dan hanya memperbarui bagian
  halaman yang berubah, tanpa redirect dan reload penuh.

Harganya juga nyata, dan saya mengalaminya sendiri. Halaman detail yang di
h05 cukup beberapa baris menjadi jauh lebih panjang di h06. CORS, loading,
dan id yang belum siap adalah masalah yang tidak pernah ada di EJS. Karena
itu kesimpulan ini tidak berlaku untuk semua kasus. Untuk situs kecil dengan
satu jenis klien yang isinya perlu langsung tampil dan terbaca mesin
pencari, misalnya blog atau halaman informasi, EJS lebih sederhana dan lebih
cepat dibuat. Kelemahan React soal tampilan pertama dan SEO juga bisa
dikurangi tanpa meninggalkan React, yaitu dengan rendering di server lewat
Next.js (SSR).

Jadi pilihannya bergantung pada kebutuhan. Untuk aplikasi interaktif yang
datanya disajikan lewat API dan berpeluang dipakai lebih dari satu klien,
seperti aplikasi posts ini, kemudahan memisahkan, menguji, dan memakai ulang
bagian-bagiannya sepadan dengan tambahan kerumitan di sisi klien.
