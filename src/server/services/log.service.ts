import { AksiLog } from '@prisma/client';

import { prisma } from '../lib/prisma';

type CreateLogPayload = {
  userId: number;
  username: string;
  aksi: AksiLog;
  modul: string;
  keterangan?: string;
  ipAddress?: string;
  userAgent?: string;
};

export class LogService {
  static async create(payload: CreateLogPayload) {
    return prisma.log.create({
      data: {
        userId: payload.userId,
        username: payload.username,
        aksi: payload.aksi,
        modul: payload.modul,
        keterangan: payload.keterangan,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      },
    });
  }
}
