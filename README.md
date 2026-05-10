# Employee Management App

> Aplikasi manajemen karyawan modern dengan sistem autentikasi OTP, manajemen absensi, perhitungan tunjangan transportasi, dan deployment berbasis Docker.

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Role Pengguna](#role-pengguna)
- [Fitur Utama](#fitur-utama)
- [Prasyarat](#prasyarat)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Proyek](#menjalankan-proyek-dengan-docker)
- [Akses Database](#akses-database-via-navicat)
- [Perintah Docker](#perintah-docker)
- [Perintah Prisma](#perintah-prisma)
- [Catatan OTP Email](#catatan-otp-email)
- [Build Produksi](#build-produksi)
- [Developer](#developer)

---

## Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| Next.js 16 | Frontend framework & fullstack app router |
| ReactJS | UI library |
| TypeScript | Strongly typed JavaScript |
| Bootstrap 5 | UI framework berbasis komponen |
| Hono | Lightweight backend framework |
| Prisma ORM | Database ORM |
| PostgreSQL | Relational database |
| Zustand | State management |
| React Hook Form | Manajemen form |
| JWT Authentication | Autentikasi yang aman |
| Docker & Docker Compose | Containerization |
| Nodemailer | Pengiriman email OTP |

---

## Struktur Proyek

```
employee-management/
│
├── src/
│   ├── app/              # Next.js App Router
│   ├── server/           # Modular backend (Hono)
│   ├── components/       # Komponen React
│   ├── store/            # Zustand state management
│   ├── utils/            # Utility functions
│   └── proxy.ts          # JWT middleware
│
├── prisma/               # Skema & migrasi database
├── public/               # Aset statis
├── docker-compose.yml
├── Dockerfile
├── package.json
└── .env
```

---

## Role Pengguna

### Hak Akses per Modul

| Modul | SUPERADMIN | MANAGER_HRD | ADMIN_HRD |
|-------|------------|-------------|-----------|
| Login / Logout | Y | Y | Y |
| Dashboard | R (sesuai role) | R (sesuai role) | R (sesuai role) |
| Kelola User | CRUD (1) | RO + UO (2) | RO + UO (2) |
| Data Pegawai | X | R | CRUD (3) |
| Tunjangan | X | RO | RO |
| Setting Tunjangan Transport | X | X | CRUD |
| Presensi | X | R | CRUD |
| Log Aktivitas | R | X | X |
| Wilayah | Y | Y | Y |

### Keterangan Simbol

| Simbol | Arti                                                       |
|--------|------------------------------------------------------------|
| Y | Bisa mengakses modul tanpa perlu aksi CRUD                 |
| X | Tidak dapat mengakses modul                                |
| C | Create - bisa membuat data baru                            |
| R | Read - bisa membaca semua data                             |
| RO | Read Only - hanya bisa membaca data miliknya sendiri       |
| U | Update - bisa memperbarui data                             |
| UO | Update Only - hanya bisa memperbarui data miliknya sendiri |
| D | Delete - bisa menghapus data                               |

### Catatan Pengecualian

- (1) Superadmin tidak dapat menghapus akun dirinya sendiri.
- (2) Manager HRD dan Admin HRD hanya bisa membaca dan mengubah data user miliknya sendiri.
- (3) Admin HRD tidak dapat menghapus data pegawai yang memiliki role Superadmin.

---

## Fitur Utama

### Autentikasi
- Login menggunakan username, email, atau nomor HP
- Validasi CAPTCHA
- Verifikasi OTP via email
- JWT authentication
- Fitur "Remember Me"

### Dashboard
- Dashboard berbasis role
- Statistik karyawan
- Grafik doughnut chart
- Tabel karyawan terbaru
- Peta domisili karyawan
- Informasi arah ke rumah terdekat

### Manajemen User
- CRUD User
- Status aktif / nonaktif
- Manajemen role
- Validasi username
- Auto-generate password
- Perlindungan self-delete

### Manajemen Karyawan
- CRUD Karyawan
- Halaman detail karyawan
- Form pendidikan dinamis
- Pencarian, pengurutan, dan filter
- Bulk delete
- Export PDF
- Upload foto karyawan

### Modul Absensi
- Import via Excel
- Detail absensi
- Validasi kehadiran
- Kalkulasi durasi kerja
- Validasi lokasi
- Sistem verifikasi

### Tunjangan Transportasi
- Konfigurasi tarif dasar
- Kalkulasi tunjangan otomatis
- Validasi jarak
- Validasi kehadiran

### Modul Log
- Aktivitas login/logout
- Log CRUD
- Pelacakan modul
- Filter rentang tanggal

---

## Prasyarat

Pastikan perangkat lunak berikut sudah terinstal:

- [Node.js](https://nodejs.org/) >= 22
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose

Verifikasi instalasi:

```bash
node -v
npm -v
docker -v
docker compose version
```

---

## Konfigurasi Environment

Buat file `.env` di root proyek:

```env
# DATABASE
DATABASE_URL="postgresql://postgres:postgres@db:5432/employee_db?schema=public"

# AUTH
JWT_SECRET="your_jwt_secret"
NEXT_PUBLIC_FETCH_URL=http://localhost:3000/api

# OTP
OTP_EXPIRED_SECONDS=60
OTP_LENGTH=6

# OFFICE LOCATION
OFFICE_LATITUDE=-7.8167834
OFFICE_LONGITUDE=110.3496963

# EMAIL
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
EMAIL_FROM="Employee Management <your_email@gmail.com>"
```

> **Penting:** Jangan pernah meng-commit file `.env` ke repositori publik.

---

## Menjalankan Proyek dengan Docker

### 1. Clone Repositori

```bash
git clone <your_repository_url>
cd employee-management
```

### 2. Build & Jalankan Container

```bash
docker compose up -d --build
```

### 3. Jalankan Migrasi Prisma

Masuk ke dalam container:

```bash
docker exec -it employee_app sh
```

Lalu jalankan:

```bash
npx prisma migrate dev
```

### 4. Jalankan Seeder

```bash
npx prisma db seed
```

### 5. Buka Aplikasi

| Layanan | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3000/api |

---

## Akses Database via Navicat

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5433` |
| Username | `postgres` |
| Password | `postgres` |
| Database | `employee_db` |

---

## Perintah Docker

```bash
# Menjalankan container
docker compose up -d

# Menghentikan container
docker compose down

# Reset database (hapus volume)
docker compose down -v

# Melihat log aplikasi
docker logs -f employee_app

# Masuk ke dalam container
docker exec -it employee_app sh
```

---

## Perintah Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Membuat migrasi baru
npx prisma migrate dev

# Menjalankan seeder
npx prisma db seed

# Membuka Prisma Studio
npx prisma studio
```

---

## Catatan OTP Email

Proyek ini menggunakan Gmail SMTP untuk pengiriman OTP.

Langkah konfigurasi Gmail:

1. Aktifkan **2-Step Verification** di akun Google
2. Buka **App Passwords** di pengaturan keamanan Google
3. Generate App Password baru
4. Masukkan App Password ke variabel `EMAIL_PASS` di file `.env`

---

## Catatan Pengembangan

- Backend menggunakan arsitektur modular di dalam `src/server`
- Hono berfungsi sebagai API handler di bawah Next.js App Router
- Prisma digunakan sebagai ORM layer
- PostgreSQL berjalan di dalam Docker container
- Bootstrap digunakan sebagai framework UI (tanpa Tailwind CSS)
- Autentikasi JWT ditangani melalui middleware & Zustand store

---

## Build Produksi

Tanpa Docker:

```bash
npm run build
npm run start
```

Dengan Docker:

```bash
docker compose up -d --build
```

> Selalu restart Docker container setelah mengubah file `.env`. Jalankan migrasi setelah mengubah skema, dan jalankan seed setelah mereset database.

---

## Developer

**Varell Abdul Rozaq Khudhori**

Dibangun dengan menggunakan Next.js, Prisma, PostgreSQL, Hono, dan Docker.