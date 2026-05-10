import { StatusAktif } from "./enums"

export interface SettingTunjanganTransport {
  id: number
  baseFare: number
  keterangan?: string | null
  statusAktif: StatusAktif
  createDate: string
  updateDate: string
}