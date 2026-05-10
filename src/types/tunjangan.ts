import { Pegawai } from "./pegawai"

export interface Tunjangan {
  id: number
  pegawaiId: number
  periode: string

  jarakKm: number
  jumlahHariMasuk: number
  baseFare: number
  totalTunjangan: number

  keterangan?: string | null

  createDate: string
  updateDate: string

  pegawai?: Pegawai
}