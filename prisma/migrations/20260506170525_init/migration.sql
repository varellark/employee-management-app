-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'MANAGER_HRD', 'ADMIN_HRD');

-- CreateEnum
CREATE TYPE "StatusKawin" AS ENUM ('KAWIN', 'TIDAK_KAWIN');

-- CreateEnum
CREATE TYPE "JenisPegawai" AS ENUM ('TETAP', 'KONTRAK', 'MAGANG');

-- CreateEnum
CREATE TYPE "Jabatan" AS ENUM ('MANAGER', 'STAF', 'MAGANG', 'KARYAWAN');

-- CreateEnum
CREATE TYPE "Departemen" AS ENUM ('MARKETING', 'HRD', 'PRODUCTION', 'EXECUTIVE', 'COMMISSIONER');

-- CreateEnum
CREATE TYPE "GenderPegawai" AS ENUM ('PRIA', 'WANITA');

-- CreateEnum
CREATE TYPE "StatusKehadiran" AS ENUM ('HADIR', 'CUTI', 'IZIN', 'UNPAID_LEAVE', 'ALPHA');

-- CreateEnum
CREATE TYPE "StatusVerifikasi" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "Verifikator" AS ENUM ('LEAD', 'MANAGER', 'HRD');

-- CreateEnum
CREATE TYPE "LokasiGedung" AS ENUM ('GEDUNG_UTAMA', 'GEDUNG_A', 'GEDUNG_B');

-- CreateEnum
CREATE TYPE "AksiLog" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "StatusAktif" AS ENUM ('ACTIVE', 'NON_ACTIVE');

-- CreateTable
CREATE TABLE "provinsi" (
    "provinsi_id" SERIAL NOT NULL,
    "provinsi_kode" TEXT NOT NULL,
    "provinsi_nama" TEXT NOT NULL,
    "provinsi_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provinsi_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinsi_pkey" PRIMARY KEY ("provinsi_id")
);

-- CreateTable
CREATE TABLE "kabupaten" (
    "kabupaten_id" SERIAL NOT NULL,
    "kabupaten_kode" TEXT NOT NULL,
    "kabupaten_nama" TEXT NOT NULL,
    "provinsi_id" INTEGER NOT NULL,
    "kabupaten_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kabupaten_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kabupaten_pkey" PRIMARY KEY ("kabupaten_id")
);

-- CreateTable
CREATE TABLE "kecamatan" (
    "kecamatan_id" SERIAL NOT NULL,
    "kecamatan_kode" TEXT NOT NULL,
    "kecamatan_nama" TEXT NOT NULL,
    "kabupaten_id" INTEGER NOT NULL,
    "kecamatan_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kecamatan_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kecamatan_pkey" PRIMARY KEY ("kecamatan_id")
);

-- CreateTable
CREATE TABLE "kalurahan" (
    "kalurahan_id" SERIAL NOT NULL,
    "kalurahan_kode" TEXT NOT NULL,
    "kalurahan_nama" TEXT NOT NULL,
    "kecamatan_id" INTEGER NOT NULL,
    "kalurahan_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kalurahan_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kalurahan_pkey" PRIMARY KEY ("kalurahan_id")
);

-- CreateTable
CREATE TABLE "pegawai" (
    "pegawai_id" SERIAL NOT NULL,
    "pegawai_nip" TEXT NOT NULL,
    "pegawai_nama" TEXT NOT NULL,
    "pegawai_email" TEXT NOT NULL,
    "pegawai_nomor_hp" TEXT NOT NULL,
    "pegawai_foto" TEXT,
    "provinsi_id" INTEGER,
    "kabupaten_id" INTEGER,
    "kecamatan_id" INTEGER,
    "kalurahan_id" INTEGER,
    "pegawai_alamat_detail" TEXT,
    "pegawai_latitude" DECIMAL(10,8),
    "pegawai_longitude" DECIMAL(11,8),
    "tempat_lahir_provinsi_id" INTEGER,
    "tempat_lahir_kabupaten_id" INTEGER,
    "pegawai_tanggal_lahir" DATE NOT NULL,
    "pegawai_gender" "GenderPegawai" NOT NULL,
    "pegawai_status_kawin" "StatusKawin" NOT NULL,
    "pegawai_jumlah_anak" INTEGER NOT NULL DEFAULT 0,
    "pegawai_tanggal_masuk" DATE NOT NULL,
    "pegawai_jabatan" "Jabatan" NOT NULL,
    "pegawai_departemen" "Departemen" NOT NULL,
    "pegawai_jenis_pegawai" "JenisPegawai" NOT NULL,
    "pegawai_status" "StatusAktif" NOT NULL DEFAULT 'ACTIVE',
    "pegawai_pendidikan" JSONB,
    "pegawai_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pegawai_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pegawai_pkey" PRIMARY KEY ("pegawai_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "pegawai_id" INTEGER NOT NULL,
    "user_username" TEXT NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_role" "Role" NOT NULL,
    "user_status" "StatusAktif" NOT NULL DEFAULT 'ACTIVE',
    "user_remember_token" TEXT,
    "user_last_login_at" TIMESTAMP(3),
    "user_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "otp_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "otp_kode" TEXT NOT NULL,
    "otp_expires_at" TIMESTAMP(3) NOT NULL,
    "otp_used" BOOLEAN NOT NULL DEFAULT false,
    "otp_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("otp_id")
);

-- CreateTable
CREATE TABLE "setting_tunjangan_transport" (
    "setting_id" SERIAL NOT NULL,
    "setting_base_fare" DECIMAL(12,2) NOT NULL,
    "setting_keterangan" TEXT,
    "setting_status" "StatusAktif" NOT NULL DEFAULT 'ACTIVE',
    "setting_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "setting_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setting_tunjangan_transport_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "tunjangan" (
    "tunjangan_id" SERIAL NOT NULL,
    "pegawai_id" INTEGER NOT NULL,
    "tunjangan_periode" TEXT NOT NULL,
    "tunjangan_jarak_km" DECIMAL(6,2) NOT NULL,
    "tunjangan_jumlah_hari_masuk" INTEGER NOT NULL,
    "tunjangan_base_fare" DECIMAL(12,2) NOT NULL,
    "tunjangan_total" DECIMAL(14,2) NOT NULL,
    "tunjangan_keterangan" TEXT,
    "tunjangan_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tunjangan_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tunjangan_pkey" PRIMARY KEY ("tunjangan_id")
);

-- CreateTable
CREATE TABLE "presensi" (
    "presensi_id" SERIAL NOT NULL,
    "pegawai_id" INTEGER NOT NULL,
    "presensi_tanggal" DATE NOT NULL,
    "presensi_checkin" "LokasiGedung",
    "presensi_checkout" "LokasiGedung",
    "presensi_waktu_checkin" TIMESTAMP(3),
    "presensi_waktu_checkout" TIMESTAMP(3),
    "presensi_durasi" INTEGER,
    "presensi_status" "StatusKehadiran" NOT NULL,
    "presensi_terpenuhi" BOOLEAN NOT NULL DEFAULT false,
    "presensi_halfday" BOOLEAN NOT NULL DEFAULT false,
    "presensi_verifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'PENDING',
    "presensi_verifikator" "Verifikator",
    "presensi_verifikator_id" INTEGER,
    "presensi_keterangan" TEXT,
    "presensi_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presensi_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presensi_pkey" PRIMARY KEY ("presensi_id")
);

-- CreateTable
CREATE TABLE "kuota_absensi" (
    "kuota_absensi_id" SERIAL NOT NULL,
    "pegawai_id" INTEGER NOT NULL,
    "kuota_tahun" INTEGER NOT NULL,
    "kuota_cuti" INTEGER NOT NULL DEFAULT 12,
    "sisa_cuti" INTEGER NOT NULL DEFAULT 12,
    "kuota_izin" INTEGER NOT NULL DEFAULT 6,
    "sisa_izin" INTEGER NOT NULL DEFAULT 6,
    "kuota_unpaid" INTEGER NOT NULL DEFAULT 3,
    "sisa_unpaid" INTEGER NOT NULL DEFAULT 3,
    "kuota_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kuota_update_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kuota_absensi_pkey" PRIMARY KEY ("kuota_absensi_id")
);

-- CreateTable
CREATE TABLE "log" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "log_username" TEXT NOT NULL,
    "log_aksi" "AksiLog" NOT NULL,
    "log_modul" TEXT NOT NULL,
    "log_keterangan" TEXT,
    "log_ip" TEXT,
    "log_user_agent" TEXT,
    "log_create_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinsi_provinsi_kode_key" ON "provinsi"("provinsi_kode");

-- CreateIndex
CREATE INDEX "provinsi_provinsi_kode_idx" ON "provinsi"("provinsi_kode");

-- CreateIndex
CREATE UNIQUE INDEX "kabupaten_kabupaten_kode_key" ON "kabupaten"("kabupaten_kode");

-- CreateIndex
CREATE INDEX "kabupaten_provinsi_id_idx" ON "kabupaten"("provinsi_id");

-- CreateIndex
CREATE INDEX "kabupaten_kabupaten_kode_idx" ON "kabupaten"("kabupaten_kode");

-- CreateIndex
CREATE UNIQUE INDEX "kecamatan_kecamatan_kode_key" ON "kecamatan"("kecamatan_kode");

-- CreateIndex
CREATE INDEX "kecamatan_kabupaten_id_idx" ON "kecamatan"("kabupaten_id");

-- CreateIndex
CREATE INDEX "kecamatan_kecamatan_kode_idx" ON "kecamatan"("kecamatan_kode");

-- CreateIndex
CREATE UNIQUE INDEX "kalurahan_kalurahan_kode_key" ON "kalurahan"("kalurahan_kode");

-- CreateIndex
CREATE INDEX "kalurahan_kecamatan_id_idx" ON "kalurahan"("kecamatan_id");

-- CreateIndex
CREATE INDEX "kalurahan_kalurahan_kode_idx" ON "kalurahan"("kalurahan_kode");

-- CreateIndex
CREATE UNIQUE INDEX "pegawai_pegawai_nip_key" ON "pegawai"("pegawai_nip");

-- CreateIndex
CREATE UNIQUE INDEX "pegawai_pegawai_email_key" ON "pegawai"("pegawai_email");

-- CreateIndex
CREATE INDEX "pegawai_provinsi_id_idx" ON "pegawai"("provinsi_id");

-- CreateIndex
CREATE INDEX "pegawai_kabupaten_id_idx" ON "pegawai"("kabupaten_id");

-- CreateIndex
CREATE INDEX "pegawai_kecamatan_id_idx" ON "pegawai"("kecamatan_id");

-- CreateIndex
CREATE INDEX "pegawai_kalurahan_id_idx" ON "pegawai"("kalurahan_id");

-- CreateIndex
CREATE INDEX "pegawai_pegawai_status_idx" ON "pegawai"("pegawai_status");

-- CreateIndex
CREATE INDEX "pegawai_pegawai_departemen_idx" ON "pegawai"("pegawai_departemen");

-- CreateIndex
CREATE INDEX "pegawai_pegawai_jabatan_idx" ON "pegawai"("pegawai_jabatan");

-- CreateIndex
CREATE INDEX "pegawai_pegawai_tanggal_masuk_idx" ON "pegawai"("pegawai_tanggal_masuk");

-- CreateIndex
CREATE UNIQUE INDEX "users_pegawai_id_key" ON "users"("pegawai_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_username_key" ON "users"("user_username");

-- CreateIndex
CREATE INDEX "users_pegawai_id_idx" ON "users"("pegawai_id");

-- CreateIndex
CREATE INDEX "users_user_status_idx" ON "users"("user_status");

-- CreateIndex
CREATE INDEX "otp_codes_user_id_idx" ON "otp_codes"("user_id");

-- CreateIndex
CREATE INDEX "otp_codes_otp_expires_at_idx" ON "otp_codes"("otp_expires_at");

-- CreateIndex
CREATE INDEX "setting_tunjangan_transport_setting_status_idx" ON "setting_tunjangan_transport"("setting_status");

-- CreateIndex
CREATE INDEX "tunjangan_pegawai_id_idx" ON "tunjangan"("pegawai_id");

-- CreateIndex
CREATE INDEX "tunjangan_tunjangan_periode_idx" ON "tunjangan"("tunjangan_periode");

-- CreateIndex
CREATE UNIQUE INDEX "tunjangan_pegawai_id_tunjangan_periode_key" ON "tunjangan"("pegawai_id", "tunjangan_periode");

-- CreateIndex
CREATE INDEX "presensi_pegawai_id_idx" ON "presensi"("pegawai_id");

-- CreateIndex
CREATE INDEX "presensi_presensi_tanggal_idx" ON "presensi"("presensi_tanggal");

-- CreateIndex
CREATE INDEX "presensi_presensi_status_idx" ON "presensi"("presensi_status");

-- CreateIndex
CREATE INDEX "presensi_presensi_verifikasi_idx" ON "presensi"("presensi_verifikasi");

-- CreateIndex
CREATE UNIQUE INDEX "presensi_pegawai_id_presensi_tanggal_key" ON "presensi"("pegawai_id", "presensi_tanggal");

-- CreateIndex
CREATE INDEX "kuota_absensi_pegawai_id_idx" ON "kuota_absensi"("pegawai_id");

-- CreateIndex
CREATE INDEX "kuota_absensi_kuota_tahun_idx" ON "kuota_absensi"("kuota_tahun");

-- CreateIndex
CREATE UNIQUE INDEX "kuota_absensi_pegawai_id_kuota_tahun_key" ON "kuota_absensi"("pegawai_id", "kuota_tahun");

-- CreateIndex
CREATE INDEX "log_user_id_idx" ON "log"("user_id");

-- CreateIndex
CREATE INDEX "log_log_aksi_idx" ON "log"("log_aksi");

-- CreateIndex
CREATE INDEX "log_log_modul_idx" ON "log"("log_modul");

-- CreateIndex
CREATE INDEX "log_log_create_date_idx" ON "log"("log_create_date");

-- AddForeignKey
ALTER TABLE "kabupaten" ADD CONSTRAINT "kabupaten_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("provinsi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kecamatan" ADD CONSTRAINT "kecamatan_kabupaten_id_fkey" FOREIGN KEY ("kabupaten_id") REFERENCES "kabupaten"("kabupaten_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kalurahan" ADD CONSTRAINT "kalurahan_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatan"("kecamatan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_provinsi_id_fkey" FOREIGN KEY ("provinsi_id") REFERENCES "provinsi"("provinsi_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_kabupaten_id_fkey" FOREIGN KEY ("kabupaten_id") REFERENCES "kabupaten"("kabupaten_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatan"("kecamatan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_kalurahan_id_fkey" FOREIGN KEY ("kalurahan_id") REFERENCES "kalurahan"("kalurahan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_tempat_lahir_provinsi_id_fkey" FOREIGN KEY ("tempat_lahir_provinsi_id") REFERENCES "provinsi"("provinsi_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_tempat_lahir_kabupaten_id_fkey" FOREIGN KEY ("tempat_lahir_kabupaten_id") REFERENCES "kabupaten"("kabupaten_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "pegawai"("pegawai_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tunjangan" ADD CONSTRAINT "tunjangan_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "pegawai"("pegawai_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi" ADD CONSTRAINT "presensi_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "pegawai"("pegawai_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log" ADD CONSTRAINT "log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
