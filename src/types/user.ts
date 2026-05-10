import { Role, StatusAktif } from "./enums"
import { Pegawai } from "./pegawai"

export interface User {
  id: number
  pegawaiId: number
  username: string
  password: string
  role: Role
  statusAktif: StatusAktif

  rememberToken?: string | null
  lastLoginAt?: string | null

  createDate: string
  updateDate: string

  pegawai?: Pegawai
}