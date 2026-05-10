import { Kabupaten } from "./kabupaten"

export interface Kecamatan {
  id: number
  kode: string
  nama: string
  kabupatenId: number
  createDate: string
  updateDate: string

  kabupaten?: Kabupaten
}