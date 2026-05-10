import { AksiLog } from "./enums"
import { User } from "./user"

export interface Log {
  id: number
  userId: number

  username: string
  aksi: AksiLog
  modul: string

  keterangan?: string | null
  ipAddress?: string | null
  userAgent?: string | null

  createDate: string

  user?: User
}