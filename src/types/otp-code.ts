import { User } from "./user"

export interface OtpCode {
  id: number
  userId: number
  kode: string
  expiresAt: string
  used: boolean
  createDate: string

  user?: User
}