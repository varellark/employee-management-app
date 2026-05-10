import { AksiLog } from '@prisma/client';

export type GetAllPayload = {
  search?: string;
  username?: string | string[];
  modul?: string | string[];
  aksi?: AksiLog;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  noPagination?: string;
};
