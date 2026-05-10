import { Role, StatusAktif } from '@prisma/client';

export type CreateUserPayload = {
  pegawaiId: number;
  username: string;
  role: Role;
  statusAktif?: StatusAktif;
};

export type UpdateUserPayload = {
  username?: string;
  role?: Role;
  statusAktif?: StatusAktif;
};

export type GetAllPayload = {
  search?: string;
  status?: StatusAktif;
  page?: string;
  limit?: string;
  noPagination?: string;
};

export type UpdateMeServicePayload = {
  name: string;
  email: string;
  phone?: string;
  password?: string;
};
