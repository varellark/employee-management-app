import { Kecamatan } from "./kecamatan"

export interface Kalurahan {
  id: number
  kode: string
  nama: string
  kecamatanId: number
  createDate: string
  updateDate: string

  kecamatan?: Kecamatan
}