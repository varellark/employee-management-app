import {
  LokasiGedung,
  StatusKehadiran,
  StatusVerifikasi,
  Verifikator,
} from "./enums"

import { Pegawai } from "./pegawai"

export interface Presensi {
  id: number
  pegawaiId: number

  tanggal: string

  lokasiCheckin?: LokasiGedung | null
  lokasiCheckout?: LokasiGedung | null

  waktuCheckin?: string | null
  waktuCheckout?: string | null

  durasi?: number | null

  statusKehadiran: StatusKehadiran
  statusTerpenuhi: boolean
  isHalfday: boolean

  statusVerifikasi: StatusVerifikasi

  verifikator?: Verifikator | null
  verifikatorId?: number | null

  keterangan?: string | null

  createDate: string
  updateDate: string

  pegawai?: Pegawai
}