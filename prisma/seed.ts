import {
  PrismaClient,
  Role,
  Jabatan,
  Departemen,
  JenisPegawai,
  GenderPegawai,
  StatusKawin,
  StatusAktif,
  StatusKehadiran,
  StatusVerifikasi,
  Verifikator,
  LokasiGedung,
} from '@prisma/client';

import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNIP(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(6, '0')}`;
}

function dateFromDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateOnly(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function checkinTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const domisiliData = [
  { lat: -7.7659, lon: 110.3786 }, // Caturtunggal
  { lat: -7.7821, lon: 110.3672 }, // Condongcatur
  { lat: -7.7512, lon: 110.4021 }, // Maguwoharjo
  { lat: -7.7943, lon: 110.3589 }, // Sinduadi
  { lat: -7.8121, lon: 110.3712 }, // Mlati
  { lat: -7.7324, lon: 110.3901 }, // Ngaglik
  { lat: -7.8234, lon: 110.4123 }, // Banguntapan
  { lat: -7.7891, lon: 110.4234 }, // Kalasan
];

interface PegawaiDef {
  nama: string;
  gender: GenderPegawai;
  jabatan: Jabatan;
  departemen: Departemen;
  jenisPegawai: JenisPegawai;
  statusKawin: StatusKawin;
  jumlahAnak: number;
  tanggalLahir: Date;
  tanggalMasuk: Date;
  role?: Role;
  username?: string;
}

async function main() {
  console.log('Seeding database (DEV MODE)...\n');

  const hashedPassword = await bcrypt.hash('Qwerty123*', 12);

  console.log('Seeding wilayah...');

  const DIY = await prisma.provinsi.upsert({
    where: { kode: '34' },
    update: {},
    create: { kode: '34', nama: 'Daerah Istimewa Yogyakarta' },
  });

  const JawaTengah = await prisma.provinsi.upsert({
    where: { kode: '33' },
    update: {},
    create: { kode: '33', nama: 'Jawa Tengah' },
  });

  const JawaBarat = await prisma.provinsi.upsert({
    where: { kode: '32' },
    update: {},
    create: { kode: '32', nama: 'Jawa Barat' },
  });

  const JawaTimur = await prisma.provinsi.upsert({
    where: { kode: '35' },
    update: {},
    create: { kode: '35', nama: 'Jawa Timur' },
  });

  const Sleman = await prisma.kabupaten.upsert({
    where: { kode: '3404' },
    update: {},
    create: { kode: '3404', nama: 'Kabupaten Sleman', provinsiId: DIY.id },
  });

  const Bantul = await prisma.kabupaten.upsert({
    where: { kode: '3402' },
    update: {},
    create: { kode: '3402', nama: 'Kabupaten Bantul', provinsiId: DIY.id },
  });

  const KotaYogya = await prisma.kabupaten.upsert({
    where: { kode: '3471' },
    update: {},
    create: { kode: '3471', nama: 'Kota Yogyakarta', provinsiId: DIY.id },
  });

  const Gunungkidul = await prisma.kabupaten.upsert({
    where: { kode: '3403' },
    update: {},
    create: { kode: '3403', nama: 'Kabupaten Gunungkidul', provinsiId: DIY.id },
  });

  const KulonProgo = await prisma.kabupaten.upsert({
    where: { kode: '3401' },
    update: {},
    create: { kode: '3401', nama: 'Kabupaten Kulon Progo', provinsiId: DIY.id },
  });

  const Magelang = await prisma.kabupaten.upsert({
    where: { kode: '3308' },
    update: {},
    create: {
      kode: '3308',
      nama: 'Kabupaten Magelang',
      provinsiId: JawaTengah.id,
    },
  });

  const Purworejo = await prisma.kabupaten.upsert({
    where: { kode: '3306' },
    update: {},
    create: {
      kode: '3306',
      nama: 'Kabupaten Purworejo',
      provinsiId: JawaTengah.id,
    },
  });

  const Bandung = await prisma.kabupaten.upsert({
    where: { kode: '3204' },
    update: {},
    create: {
      kode: '3204',
      nama: 'Kabupaten Bandung',
      provinsiId: JawaBarat.id,
    },
  });

  const Malang = await prisma.kabupaten.upsert({
    where: { kode: '3507' },
    update: {},
    create: {
      kode: '3507',
      nama: 'Kabupaten Malang',
      provinsiId: JawaTimur.id,
    },
  });

  const Depok = await prisma.kecamatan.upsert({
    where: { kode: '3404180' },
    update: {},
    create: { kode: '3404180', nama: 'Depok', kabupatenId: Sleman.id },
  });

  const Mlati = await prisma.kecamatan.upsert({
    where: { kode: '3404050' },
    update: {},
    create: { kode: '3404050', nama: 'Mlati', kabupatenId: Sleman.id },
  });

  const Ngaglik = await prisma.kecamatan.upsert({
    where: { kode: '3404160' },
    update: {},
    create: { kode: '3404160', nama: 'Ngaglik', kabupatenId: Sleman.id },
  });

  const Godean = await prisma.kecamatan.upsert({
    where: { kode: '3404040' },
    update: {},
    create: { kode: '3404040', nama: 'Godean', kabupatenId: Sleman.id },
  });

  const Gamping = await prisma.kecamatan.upsert({
    where: { kode: '3404030' },
    update: {},
    create: { kode: '3404030', nama: 'Gamping', kabupatenId: Sleman.id },
  });

  const Kasihan = await prisma.kecamatan.upsert({
    where: { kode: '3402010' },
    update: {},
    create: { kode: '3402010', nama: 'Kasihan', kabupatenId: Bantul.id },
  });

  const Sewon = await prisma.kecamatan.upsert({
    where: { kode: '3402020' },
    update: {},
    create: { kode: '3402020', nama: 'Sewon', kabupatenId: Bantul.id },
  });

  const Gondokusuman = await prisma.kecamatan.upsert({
    where: { kode: '3471020' },
    update: {},
    create: {
      kode: '3471020',
      nama: 'Gondokusuman',
      kabupatenId: KotaYogya.id,
    },
  });

  const Umbulharjo = await prisma.kecamatan.upsert({
    where: { kode: '3471070' },
    update: {},
    create: { kode: '3471070', nama: 'Umbulharjo', kabupatenId: KotaYogya.id },
  });

  const Caturtunggal = await prisma.kalurahan.upsert({
    where: { kode: '3404180003' },
    update: {},
    create: { kode: '3404180003', nama: 'Caturtunggal', kecamatanId: Depok.id },
  });

  const Condongcatur = await prisma.kalurahan.upsert({
    where: { kode: '3404180002' },
    update: {},
    create: { kode: '3404180002', nama: 'Condongcatur', kecamatanId: Depok.id },
  });

  const Maguwoharjo = await prisma.kalurahan.upsert({
    where: { kode: '3404180001' },
    update: {},
    create: { kode: '3404180001', nama: 'Maguwoharjo', kecamatanId: Depok.id },
  });

  const Sinduadi = await prisma.kalurahan.upsert({
    where: { kode: '3404050003' },
    update: {},
    create: { kode: '3404050003', nama: 'Sinduadi', kecamatanId: Mlati.id },
  });

  const Sendangadi = await prisma.kalurahan.upsert({
    where: { kode: '3404050004' },
    update: {},
    create: { kode: '3404050004', nama: 'Sendangadi', kecamatanId: Mlati.id },
  });

  const Minomartani = await prisma.kalurahan.upsert({
    where: { kode: '3404160002' },
    update: {},
    create: {
      kode: '3404160002',
      nama: 'Minomartani',
      kecamatanId: Ngaglik.id,
    },
  });

  const Sardonoharjo = await prisma.kalurahan.upsert({
    where: { kode: '3404160003' },
    update: {},
    create: {
      kode: '3404160003',
      nama: 'Sardonoharjo',
      kecamatanId: Ngaglik.id,
    },
  });

  const Sidokarto = await prisma.kalurahan.upsert({
    where: { kode: '3404040002' },
    update: {},
    create: { kode: '3404040002', nama: 'Sidokarto', kecamatanId: Godean.id },
  });

  const Ambarketawang = await prisma.kalurahan.upsert({
    where: { kode: '3404030001' },
    update: {},
    create: {
      kode: '3404030001',
      nama: 'Ambarketawang',
      kecamatanId: Gamping.id,
    },
  });

  const Tirtonirmolo = await prisma.kalurahan.upsert({
    where: { kode: '3402010004' },
    update: {},
    create: {
      kode: '3402010004',
      nama: 'Tirtonirmolo',
      kecamatanId: Kasihan.id,
    },
  });

  const Panggungharjo = await prisma.kalurahan.upsert({
    where: { kode: '3402020001' },
    update: {},
    create: {
      kode: '3402020001',
      nama: 'Panggungharjo',
      kecamatanId: Sewon.id,
    },
  });

  const Baciro = await prisma.kalurahan.upsert({
    where: { kode: '3471020004' },
    update: {},
    create: {
      kode: '3471020004',
      nama: 'Baciro',
      kecamatanId: Gondokusuman.id,
    },
  });

  const Sorosutan = await prisma.kalurahan.upsert({
    where: { kode: '3471070006' },
    update: {},
    create: {
      kode: '3471070006',
      nama: 'Sorosutan',
      kecamatanId: Umbulharjo.id,
    },
  });

  const kalurahanList = [
    Caturtunggal,
    Condongcatur,
    Maguwoharjo,
    Sinduadi,
    Sendangadi,
    Minomartani,
    Sardonoharjo,
    Sidokarto,
    Ambarketawang,
    Tirtonirmolo,
    Panggungharjo,
    Baciro,
    Sorosutan,
  ];

  const kecamatanList = [
    Depok,
    Mlati,
    Ngaglik,
    Godean,
    Gamping,
    Kasihan,
    Sewon,
    Gondokusuman,
    Umbulharjo,
  ];
  const kabupatenDomisiliList = [Sleman, Sleman, Sleman, Bantul, KotaYogya];
  const kabupatenLahirList = [
    Sleman,
    Bantul,
    KotaYogya,
    Gunungkidul,
    KulonProgo,
    Magelang,
    Purworejo,
    Bandung,
    Malang,
  ];
  const provinsiLahirList = [DIY, DIY, DIY, JawaTengah, JawaBarat, JawaTimur];

  console.log('Wilayah selesai\n');

  console.log('Seeding setting tunjangan...');

  await prisma.settingTunjanganTransport.upsert({
    where: { id: 1 },
    update: {},
    create: {
      baseFare: 2500,
      keterangan: 'Tarif awal tunjangan transport per km per hari',
      statusAktif: StatusAktif.ACTIVE,
    },
  });

  await prisma.settingTunjanganTransport.upsert({
    where: { id: 2 },
    update: {},
    create: {
      baseFare: 3000,
      keterangan: 'Tarif revisi 2024 tunjangan transport per km per hari',
      statusAktif: StatusAktif.NON_ACTIVE,
    },
  });

  console.log('Setting tunjangan selesai\n');

  console.log('Seeding pegawai & user...');

  const pegawaiDefinitions: PegawaiDef[] = [
    // SUPERADMIN
    {
      nama: 'Super Administrator',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.MANAGER,
      departemen: Departemen.EXECUTIVE,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 2,
      tanggalLahir: new Date('1985-03-15'),
      tanggalMasuk: new Date('2015-01-01'),
      role: Role.SUPERADMIN,
      username: 'superadmin',
    },
    // MANAGER HRD
    {
      nama: 'Siti Rahayu',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.MANAGER,
      departemen: Departemen.HRD,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 1,
      tanggalLahir: new Date('1987-06-20'),
      tanggalMasuk: new Date('2016-03-01'),
      role: Role.MANAGER_HRD,
      username: 'manager.hrd',
    },
    // ADMIN HRD
    {
      nama: 'Dewi Puspita',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.HRD,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1995-08-12'),
      tanggalMasuk: new Date('2019-04-01'),
      role: Role.ADMIN_HRD,
      username: 'admin.hrd',
    },
    // STAF HRD (tidak punya akun)
    {
      nama: 'Rina Marlina',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.HRD,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 1,
      tanggalLahir: new Date('1993-02-28'),
      tanggalMasuk: new Date('2018-07-01'),
    },
    // EXECUTIVE
    {
      nama: 'Budi Santoso',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.MANAGER,
      departemen: Departemen.EXECUTIVE,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 3,
      tanggalLahir: new Date('1978-11-05'),
      tanggalMasuk: new Date('2010-01-15'),
    },
    {
      nama: 'Agus Setiawan',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.EXECUTIVE,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 2,
      tanggalLahir: new Date('1982-04-17'),
      tanggalMasuk: new Date('2012-05-01'),
    },
    // MARKETING
    {
      nama: 'Hendra Wijaya',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.MANAGER,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 2,
      tanggalLahir: new Date('1983-09-23'),
      tanggalMasuk: new Date('2013-02-01'),
    },
    {
      nama: 'Fitri Handayani',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1996-01-30'),
      tanggalMasuk: new Date('2020-08-01'),
    },
    {
      nama: 'Rizky Pratama',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1997-05-14'),
      tanggalMasuk: new Date('2021-01-15'),
    },
    {
      nama: 'Yuni Astuti',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 1,
      tanggalLahir: new Date('1994-07-07'),
      tanggalMasuk: new Date('2022-03-01'),
    },
    {
      nama: 'Fajar Nugroho',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1999-12-03'),
      tanggalMasuk: new Date('2023-01-02'),
    },
    {
      nama: 'Nanda Kusumawati',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.MAGANG,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.MAGANG,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('2001-03-22'),
      tanggalMasuk: new Date('2024-02-01'),
    },
    // PRODUCTION
    {
      nama: 'Dani Kurniawan',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.MANAGER,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 3,
      tanggalLahir: new Date('1980-12-10'),
      tanggalMasuk: new Date('2011-06-01'),
    },
    {
      nama: 'Eko Purnomo',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 2,
      tanggalLahir: new Date('1988-08-08'),
      tanggalMasuk: new Date('2014-09-01'),
    },
    {
      nama: 'Galih Saputra',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 1,
      tanggalLahir: new Date('1990-03-25'),
      tanggalMasuk: new Date('2016-11-01'),
    },
    {
      nama: 'Indah Permata',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1995-06-18'),
      tanggalMasuk: new Date('2019-01-07'),
    },
    {
      nama: 'Irvan Hidayat',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1998-10-15'),
      tanggalMasuk: new Date('2022-07-01'),
    },
    {
      nama: 'Heni Lestari',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 1,
      tanggalLahir: new Date('1992-09-09'),
      tanggalMasuk: new Date('2021-10-01'),
    },
    {
      nama: 'Joko Susanto',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 2,
      tanggalLahir: new Date('1991-07-04'),
      tanggalMasuk: new Date('2023-04-01'),
    },
    {
      nama: 'Gita Savitri',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.MAGANG,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.MAGANG,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('2002-01-11'),
      tanggalMasuk: new Date('2024-01-15'),
    },
    {
      nama: 'Lukman Hakim',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.MAGANG,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.MAGANG,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('2002-05-20'),
      tanggalMasuk: new Date('2024-02-01'),
    },
    // COMMISSIONER
    {
      nama: 'Muhammad Fauzi',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.MANAGER,
      departemen: Departemen.COMMISSIONER,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 4,
      tanggalLahir: new Date('1970-06-01'),
      tanggalMasuk: new Date('2005-01-01'),
    },
    {
      nama: 'Laras Ayu',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.COMMISSIONER,
      jenisPegawai: JenisPegawai.TETAP,
      statusKawin: StatusKawin.KAWIN,
      jumlahAnak: 2,
      tanggalLahir: new Date('1985-04-15'),
      tanggalMasuk: new Date('2012-08-01'),
    },

    // PEGAWAI NON AKTIF
    {
      nama: 'Novan Andriyanto',
      gender: GenderPegawai.PRIA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.MARKETING,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1996-11-20'),
      tanggalMasuk: new Date('2021-06-01'),
    },
    {
      nama: 'Fina Rahmawati',
      gender: GenderPegawai.WANITA,
      jabatan: Jabatan.STAF,
      departemen: Departemen.PRODUCTION,
      jenisPegawai: JenisPegawai.KONTRAK,
      statusKawin: StatusKawin.TIDAK_KAWIN,
      jumlahAnak: 0,
      tanggalLahir: new Date('1997-03-08'),
      tanggalMasuk: new Date('2022-01-10'),
    },
  ];

  // NIP prefix per departemen
  const nipPrefix: Record<Departemen, string> = {
    EXECUTIVE: '10',
    HRD: '20',
    MARKETING: '30',
    PRODUCTION: '40',
    COMMISSIONER: '50',
  };

  const nipCounters: Record<string, number> = {};

  const pegawaiMap: Map<string, number> = new Map();

  const nonAktifNamas = ['Novan Andriyanto', 'Fina Rahmawati'];

  for (const def of pegawaiDefinitions) {
    const prefix =
      def.nama === 'Super Administrator' ? '00' : nipPrefix[def.departemen];
    nipCounters[prefix] = (nipCounters[prefix] || 0) + 1;
    const nip = def.nama === 'Super Administrator'
      ? '00000001'
      : generateNIP(prefix, nipCounters[prefix]);

    const emailPart = def.nama
      .toLowerCase()
      .replace(/\s+/g, '.')
      .replace(/[^a-z.]/g, '');

    const email =
      def.nama === 'Super Administrator'
        ? 'superadmin@pegawai.app'
        : `${emailPart}@pegawai.app`;

    const domisili = randomElement(domisiliData);
    const kal = randomElement(kalurahanList);
    const kabDomisili = randomElement(kabupatenDomisiliList);
    const kabLahir = randomElement(kabupatenLahirList);
    const provLahir = randomElement(provinsiLahirList);

    const statusAktif = nonAktifNamas.includes(def.nama)
      ? StatusAktif.NON_ACTIVE
      : StatusAktif.ACTIVE;

    const pendidikanData = [
      [
        {
          jenjang: 'SD',
          jurusan: '-',
          institusi: 'SD N 1 Yogyakarta',
          tahunLulus: 2001,
        },
        {
          jenjang: 'SMP',
          jurusan: '-',
          institusi: 'SMP N 1 Yogyakarta',
          tahunLulus: 2004,
        },
        {
          jenjang: 'SMA/SMK',
          jurusan: 'IPA',
          institusi: 'SMA N 1 Yogyakarta',
          tahunLulus: 2007,
        },
        {
          jenjang: 'S1',
          jurusan: 'Teknik Informatika',
          institusi: 'Universitas Gadjah Mada',
          tahunLulus: 2011,
        },
      ],
      [
        {
          jenjang: 'SD',
          jurusan: '-',
          institusi: 'SD N 2 Sleman',
          tahunLulus: 2003,
        },
        {
          jenjang: 'SMP',
          jurusan: '-',
          institusi: 'SMP N 2 Sleman',
          tahunLulus: 2006,
        },
        {
          jenjang: 'SMA/SMK',
          jurusan: 'Akuntansi',
          institusi: 'SMK N 1 Yogyakarta',
          tahunLulus: 2009,
        },
        {
          jenjang: 'D3',
          jurusan: 'Akuntansi',
          institusi: 'UPN Veteran Yogyakarta',
          tahunLulus: 2012,
        },
      ],
      [
        {
          jenjang: 'SD',
          jurusan: '-',
          institusi: 'SD N 3 Bantul',
          tahunLulus: 2000,
        },
        {
          jenjang: 'SMP',
          jurusan: '-',
          institusi: 'SMP N 3 Bantul',
          tahunLulus: 2003,
        },
        {
          jenjang: 'SMA/SMK',
          jurusan: 'IPS',
          institusi: 'SMA N 2 Bantul',
          tahunLulus: 2006,
        },
        {
          jenjang: 'S1',
          jurusan: 'Manajemen',
          institusi: 'Universitas Islam Indonesia',
          tahunLulus: 2010,
        },
        {
          jenjang: 'S2',
          jurusan: 'Manajemen',
          institusi: 'Universitas Islam Indonesia',
          tahunLulus: 2013,
        },
      ],
      [
        {
          jenjang: 'SD',
          jurusan: '-',
          institusi: 'SD N 4 Depok',
          tahunLulus: 2004,
        },
        {
          jenjang: 'SMP',
          jurusan: '-',
          institusi: 'SMP N 4 Depok',
          tahunLulus: 2007,
        },
        {
          jenjang: 'SMA/SMK',
          jurusan: 'SIJA',
          institusi: 'SMK N 2 Yogyakarta',
          tahunLulus: 2010,
        },
      ],
    ];

    const pegawai = await prisma.pegawai.upsert({
      where: { nip },
      update: {},
      create: {
        nip,
        nama: def.nama,
        email,
        nomorHp: `+628${randomInt(10000000, 99999999)}`,
        gender: def.gender,
        tanggalLahir: def.tanggalLahir,
        statusKawin: def.statusKawin,
        jumlahAnak: def.jumlahAnak,
        tanggalMasuk: def.tanggalMasuk,
        jabatan: def.jabatan,
        departemen: def.departemen,
        jenisPegawai: def.jenisPegawai,
        statusAktif,
        provinsiId:
          def.nama === 'Super Administrator'
            ? DIY.id
            : (kabDomisili.provinsiId ?? DIY.id),
        kabupatenId:
          def.nama === 'Super Administrator' ? Sleman.id : kabDomisili.id,
        kecamatanId:
          def.nama === 'Super Administrator'
            ? Depok.id
            : randomElement(kecamatanList).id,
        kalurahanId:
          def.nama === 'Super Administrator' ? Caturtunggal.id : kal.id,
        alamatDetail: `Jl. ${randomElement(['Mawar', 'Melati', 'Kenanga', 'Flamboyan', 'Nusa Indah'])} No.${randomInt(1, 99)}, RT ${randomInt(1, 10)} RW ${randomInt(1, 5)}`,
        latitude: def.nama === 'Super Administrator' ? -7.7659 : domisili.lat,
        longitude: def.nama === 'Super Administrator' ? 110.3786 : domisili.lon,
        tempatLahirProvinsiId: provLahir.id,
        tempatLahirKabupatenId: kabLahir.id,
        pendidikan: randomElement(pendidikanData),
        foto: null,
      },
    });

    pegawaiMap.set(def.nama, pegawai.id);

    if (def.role && def.username) {
      await prisma.user.upsert({
        where: { username: def.username },
        update: {},
        create: {
          pegawaiId: pegawai.id,
          username: def.username,
          password: hashedPassword,
          role: def.role,
          statusAktif: StatusAktif.ACTIVE,
        },
      });
    }
  }

  console.log(`${pegawaiDefinitions.length} pegawai selesai\n`);

  console.log('Seeding kuota absensi...');

  const allPegawai = await prisma.pegawai.findMany({ select: { id: true } });
  const tahunList = [2023, 2024, 2025];

  for (const pg of allPegawai) {
    for (const tahun of tahunList) {
      const sisaCuti = randomInt(0, 12);
      const sisaIzin = randomInt(0, 6);
      const sisaUnpaid = randomInt(0, 3);

      await prisma.kuotaAbsensi.upsert({
        where: { pegawaiId_tahun: { pegawaiId: pg.id, tahun } },
        update: {},
        create: {
          pegawaiId: pg.id,
          tahun,
          kuotaCuti: 12,
          sisaCuti,
          kuotaIzin: 6,
          sisaIzin,
          kuotaUnpaid: 3,
          sisaUnpaid,
        },
      });
    }
  }

  console.log(
    `Kuota absensi selesai (${allPegawai.length * tahunList.length} records)\n`
  );

  console.log('Seeding presensi...');

  const pegawaiAktif = await prisma.pegawai.findMany({
    where: { statusAktif: StatusAktif.ACTIVE },
    select: { id: true, nama: true },
  });

  const lokasi = [
    LokasiGedung.GEDUNG_UTAMA,
    LokasiGedung.GEDUNG_A,
    LokasiGedung.GEDUNG_B,
  ];
  let presensiCount = 0;

  for (const pg of pegawaiAktif) {
    for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
      const tanggal = dateFromDaysAgo(daysAgo);
      const dayOfWeek = tanggal.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const rand = Math.random();
      let statusKehadiran: StatusKehadiran;
      let lokasiCheckin: LokasiGedung | null = null;
      let lokasiCheckout: LokasiGedung | null = null;
      let waktuCheckin: Date | null = null;
      let waktuCheckout: Date | null = null;
      let durasi: number | null = null;
      let isHalfday = false;
      let statusTerpenuhi = false;
      let statusVerifikasi: StatusVerifikasi = StatusVerifikasi.DISETUJUI;
      let verifikator: Verifikator | null = null;
      const verifikatorId: number | null = null;
      let keterangan: string | null = null;

      if (rand < 0.78) {
        statusKehadiran = StatusKehadiran.HADIR;
        lokasiCheckin = randomElement(lokasi);
        lokasiCheckout = randomElement(lokasi);
        const checkinHour = randomInt(7, 9);
        const checkinMinute = randomInt(0, 59);
        waktuCheckin = checkinTime(tanggal, checkinHour, checkinMinute);
        const checkoutHour = randomInt(16, 18);
        const checkoutMinute = randomInt(0, 59);
        waktuCheckout = checkinTime(tanggal, checkoutHour, checkoutMinute);
        durasi = Math.round(
          (waktuCheckout.getTime() - waktuCheckin.getTime()) / 60000
        );
        statusTerpenuhi = durasi >= 480;
        isHalfday = durasi >= 240 && durasi < 480;
        statusVerifikasi = StatusVerifikasi.DISETUJUI;
      } else if (rand < 0.86) {
        statusKehadiran = StatusKehadiran.CUTI;
        statusVerifikasi = randomElement([
          StatusVerifikasi.DISETUJUI,
          StatusVerifikasi.DISETUJUI,
          StatusVerifikasi.PENDING,
        ]);
        verifikator = randomElement([Verifikator.MANAGER, Verifikator.HRD]);
        keterangan = randomElement([
          'Cuti tahunan',
          'Cuti keluarga',
          'Cuti menikah',
          'Cuti melahirkan',
          null,
        ]);
      } else if (rand < 0.91) {
        statusKehadiran = StatusKehadiran.IZIN;
        statusVerifikasi = randomElement([
          StatusVerifikasi.DISETUJUI,
          StatusVerifikasi.PENDING,
        ]);
        verifikator = randomElement([Verifikator.LEAD, Verifikator.MANAGER]);
        keterangan = randomElement([
          'Keperluan keluarga',
          'Sakit ringan',
          'Urusan pribadi',
          'Keperluan administrasi',
        ]);
      } else if (rand < 0.93) {
        statusKehadiran = StatusKehadiran.UNPAID_LEAVE;
        statusVerifikasi = randomElement([
          StatusVerifikasi.DISETUJUI,
          StatusVerifikasi.DITOLAK,
          StatusVerifikasi.PENDING,
        ]);
        verifikator = Verifikator.HRD;
        keterangan = 'Unpaid leave atas permintaan sendiri';
      } else {
        statusKehadiran = StatusKehadiran.ALPHA;
        statusVerifikasi = StatusVerifikasi.DISETUJUI;
        keterangan = null;
      }

      try {
        await prisma.presensi.upsert({
          where: {
            pegawaiId_tanggal: { pegawaiId: pg.id, tanggal: dateOnly(tanggal) },
          },
          update: {},
          create: {
            pegawaiId: pg.id,
            tanggal: dateOnly(tanggal),
            lokasiCheckin: lokasiCheckin ?? undefined,
            lokasiCheckout: lokasiCheckout ?? undefined,
            waktuCheckin: waktuCheckin ?? undefined,
            waktuCheckout: waktuCheckout ?? undefined,
            durasi: durasi ?? undefined,
            statusKehadiran,
            statusTerpenuhi,
            isHalfday,
            statusVerifikasi,
            verifikator: verifikator ?? undefined,
            verifikatorId: verifikatorId ?? undefined,
            keterangan: keterangan ?? undefined,
          },
        });
        presensiCount++;
      } catch {}
    }
  }

  console.log(`Presensi selesai (${presensiCount} records)\n`);

  console.log('Seeding tunjangan...');

  let tunjanganCount = 0;
  const today = new Date();

  for (const pg of pegawaiAktif) {
    for (let m = 11; m >= 0; m--) {
      const periodeDate = new Date(
        today.getFullYear(),
        today.getMonth() - m,
        1
      );
      const periode = `${periodeDate.getFullYear()}-${String(periodeDate.getMonth() + 1).padStart(2, '0')}`;

      const jarakKm = parseFloat((randomInt(2, 25) + Math.random()).toFixed(2));
      const jumlahHariMasuk = randomInt(18, 22);
      const baseFare = 2500;
      const totalTunjangan = parseFloat(
        (jarakKm * 2 * jumlahHariMasuk * baseFare).toFixed(2)
      );

      try {
        await prisma.tunjangan.upsert({
          where: { pegawaiId_periode: { pegawaiId: pg.id, periode } },
          update: {},
          create: {
            pegawaiId: pg.id,
            periode,
            jarakKm,
            jumlahHariMasuk,
            baseFare,
            totalTunjangan,
            keterangan: `Tunjangan transport periode ${periode}`,
          },
        });
        tunjanganCount++;
      } catch {
        // skip
      }
    }
  }

  console.log(`Tunjangan selesai (${tunjanganCount} records)\n`);

  console.log('='.repeat(55));
  console.log('SEEDING SELESAI!');
  console.log('='.repeat(55));

  const counts = await Promise.all([
    prisma.provinsi.count(),
    prisma.kabupaten.count(),
    prisma.kecamatan.count(),
    prisma.kalurahan.count(),
    prisma.pegawai.count(),
    prisma.user.count(),
    prisma.presensi.count(),
    prisma.tunjangan.count(),
    prisma.kuotaAbsensi.count(),
    prisma.log.count(),
    prisma.otpCode.count(),
  ]);

  console.log(`Provinsi       : ${counts[0]}`);
  console.log(`Kabupaten      : ${counts[1]}`);
  console.log(`Kecamatan      : ${counts[2]}`);
  console.log(`Kalurahan      : ${counts[3]}`);
  console.log(`Pegawai        : ${counts[4]}`);
  console.log(`User           : ${counts[5]}`);
  console.log(`Presensi       : ${counts[6]}`);
  console.log(`Tunjangan      : ${counts[7]}`);
  console.log(`Kuota Absensi  : ${counts[8]}`);
  console.log(`Log Aktivitas  : ${counts[9]}`);
  console.log(`OTP Codes      : ${counts[10]}`);
  console.log('='.repeat(55));

  console.log('\n AKUN TERSEDIA:');
  console.log('─'.repeat(45));
  console.log('Role          Username        Password');
  console.log('─'.repeat(45));
  console.log('SUPERADMIN    superadmin      Qwerty123*');
  console.log('MANAGER_HRD   manager.hrd     Qwerty123*');
  console.log('ADMIN_HRD     admin.hrd       Qwerty123*');
  console.log('─'.repeat(45));
}

main()
  .catch((error) => {
    console.error('Error seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
