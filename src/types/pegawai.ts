import {
  Departemen,
  GenderPegawai,
  Jabatan,
  JenisPegawai,
  StatusAktif,
  StatusKawin,
} from "./enums"

import { Provinsi } from "./provinsi"
import { Kabupaten } from "./kabupaten"
import { Kecamatan } from "./kecamatan"
import { Kalurahan } from "./kalurahan"

export interface PendidikanPegawai {
  jenjang: string
  institusi: string
  jurusan?: string
  tahunMasuk?: number
  tahunLulus?: number
}

export interface Pegawai {
  id: number
  nip: string
  nama: string
  email: string
  nomorHp: string
  foto?: string | null

  provinsiId?: number | null
  kabupatenId?: number | null
  kecamatanId?: number | null
  kalurahanId?: number | null

  alamatDetail?: string | null

  latitude?: number | null
  longitude?: number | null

  tempatLahirProvinsiId?: number | null
  tempatLahirKabupatenId?: number | null

  tanggalLahir: string
  gender: GenderPegawai
  statusKawin: StatusKawin
  jumlahAnak: number

  tanggalMasuk: string
  masaKerja: number

  jabatan: Jabatan
  departemen: Departemen
  jenisPegawai: JenisPegawai
  statusAktif: StatusAktif

  pendidikan?: PendidikanPegawai[] | null

  createDate: string
  updateDate: string

  provinsi?: Provinsi | null
  kabupaten?: Kabupaten | null
  kecamatan?: Kecamatan | null
  kalurahan?: Kalurahan | null

  tempatLahirProvinsi?: Provinsi | null
  tempatLahirKabupaten?: Kabupaten | null
}