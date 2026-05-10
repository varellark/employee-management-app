import { authPaths } from './paths/auth';
import { userPaths } from './paths/users';
import { pegawaiPaths } from './paths/pegawai';
import { presensiPaths } from './paths/presensi';
import { tunjanganPaths } from './paths/tunjangan';
import {
  settingTunjanganPaths,
  dashboardPaths,
  logPaths,
  wilayahPaths,
} from './paths/others';
import { components } from './components/index';

export const openApiSpec = {
  openapi: '3.0.0',

  info: {
    title: 'Employee Management API',
    version: '1.0.0',
    description: `
## Employee Management System API

API untuk sistem manajemen kepegawaian yang mencakup:
- **Auth** - Login dengan OTP dua faktor
- **Users** - Manajemen akun pengguna sistem
- **Pegawai** - Data master pegawai
- **Presensi** - Pencatatan dan verifikasi kehadiran
- **Tunjangan** - Perhitungan dan generate tunjangan
- **Setting Tunjangan** - Konfigurasi tarif tunjangan
- **Dashboard** - Statistik dan ringkasan data
- **Logs** - Activity log sistem
- **Wilayah** - Referensi data wilayah Indonesia

## Role & Hak Akses
 
| Modul | SUPERADMIN | MANAGER_HRD | ADMIN_HRD |
|-------|:----------:|:-----------:|:---------:|
| Login / Logout | Y | Y | Y |
| Dashboard | R (sesuai role) | R (sesuai role) | R (sesuai role) |
| Kelola User | CRUD ¹ | RO + UO ² | RO + UO ² |
| Data Pegawai | X | R | CRUD ³ |
| Tunjangan | X | RO | RO |
| Setting Tunjangan Transport | X | X | CRUD |
| Presensi | X | R | CRUD |
| Log Aktivitas | R | X | X |

**Keterangan:**
- **Y** = Bisa mengakses modul tanpa perlu aksi CRUD
- **X** = Tidak dapat mengakses modul
- **C** = Create - bisa membuat data baru
- **R** = Read - bisa membaca semua data
- **RO** = Read Only - hanya bisa membaca data miliknya sendiri
- **U** = Update - bisa memperbarui data
- **UO** = Update Only - hanya bisa memperbarui data miliknya sendiri
- **D** = Delete - bisa menghapus data
 
**Catatan pengecualian:**
> ¹ Superadmin tidak dapat menghapus akun dirinya sendiri.
> ² Manager HRD dan Admin HRD hanya bisa membaca dan mengubah data user miliknya sendiri.
> ³ Admin HRD tidak dapat menghapus data pegawai yang memiliki role Superadmin.

## Autentikasi
Semua endpoint (kecuali \`/auth/login\` dan \`/auth/verify-otp\`) memerlukan Bearer token.
Token diperoleh dari response \`/auth/verify-otp\` setelah OTP berhasil diverifikasi.
    `.trim(),
    contact: {
      name: 'Tim Pengembang',
    },
  },

  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],

  tags: [
    { name: 'Auth', description: 'Autentikasi dan sesi pengguna' },
    { name: 'Users', description: 'Manajemen akun pengguna sistem' },
    { name: 'Pegawai', description: 'Data master pegawai' },
    { name: 'Presensi', description: 'Pencatatan dan verifikasi kehadiran' },
    {
      name: 'Tunjangan',
      description: 'Perhitungan dan generate tunjangan transport',
    },
    {
      name: 'Setting Tunjangan',
      description: 'Konfigurasi tarif dasar tunjangan',
    },
    { name: 'Dashboard', description: 'Statistik dan ringkasan data' },
    { name: 'Logs', description: 'Activity log seluruh aktivitas sistem' },
    {
      name: 'Wilayah',
      description:
        'Referensi data wilayah (provinsi, kabupaten, kecamatan, kalurahan)',
    },
  ],

  paths: {
    ...authPaths,
    ...userPaths,
    ...pegawaiPaths,
    ...presensiPaths,
    ...tunjanganPaths,
    ...settingTunjanganPaths,
    ...dashboardPaths,
    ...logPaths,
    ...wilayahPaths,
  },

  components,

  security: [{ bearerAuth: [] }],
};
