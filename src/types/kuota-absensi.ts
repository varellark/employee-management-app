export interface KuotaAbsensi {
  id: number
  pegawaiId: number

  tahun: number

  kuotaCuti: number
  sisaCuti: number

  kuotaIzin: number
  sisaIzin: number

  kuotaUnpaid: number
  sisaUnpaid: number

  createDate: string
  updateDate: string
}