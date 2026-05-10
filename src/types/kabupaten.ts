import { Provinsi } from "./provinsi"

export interface Kabupaten {
  id: number
  kode: string
  nama: string
  provinsiId: number
  createDate: string
  updateDate: string

  provinsi?: Provinsi
}