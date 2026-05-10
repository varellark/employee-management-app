import { Prisma, StatusAktif } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Pagination } from '@/server/helpers';
import type {
  GetAllSettingQuery,
  UpdateSettingPayload,
  CreateSettingPayload,
} from './settingTunjangan.type';

export class SettingTunjanganService {
  static async getAll(query: GetAllSettingQuery) {
    const { status, page = '1', limit = '10', noPagination = 'false' } = query;

    const usePagination = noPagination !== 'true';

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const filters: Prisma.SettingTunjanganTransportWhereInput = {
      ...(status
        ? {
            statusAktif: status,
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.settingTunjanganTransport.findMany({
        where: filters,

        orderBy: {
          createDate: 'desc',
        },

        ...(usePagination
          ? {
              skip: (pageNumber - 1) * limitNumber,
              take: limitNumber,
            }
          : {}),
      }),

      prisma.settingTunjanganTransport.count({
        where: filters,
      }),
    ]);

    return {
      data,

      ...(usePagination
        ? {
            pagination: Pagination({
              page: pageNumber,
              limit: limitNumber,
              total,
            }),
          }
        : {
            total,
          }),
    };
  }

  static async getActive() {
    return prisma.settingTunjanganTransport.findFirst({
      where: { statusAktif: StatusAktif.ACTIVE },
      orderBy: { createDate: 'desc' },
    });
  }

  static async findById(id: number) {
    return prisma.settingTunjanganTransport.findUnique({ where: { id } });
  }

  static async create(payload: CreateSettingPayload) {
    if (!payload.statusAktif || payload.statusAktif === 'ACTIVE') {
      await prisma.settingTunjanganTransport.updateMany({
        where: { statusAktif: StatusAktif.ACTIVE },
        data: { statusAktif: StatusAktif.NON_ACTIVE },
      });
    }

    return prisma.settingTunjanganTransport.create({
      data: {
        baseFare: payload.baseFare,
        keterangan: payload.keterangan,
        statusAktif: payload.statusAktif ?? StatusAktif.ACTIVE,
      },
    });
  }

  static async update(id: number, payload: UpdateSettingPayload) {
    if (payload.statusAktif === 'ACTIVE') {
      await prisma.settingTunjanganTransport.updateMany({
        where: { statusAktif: StatusAktif.ACTIVE, id: { not: id } },
        data: { statusAktif: StatusAktif.NON_ACTIVE },
      });
    }

    return prisma.settingTunjanganTransport.update({
      where: { id },
      data: {
        ...(payload.baseFare !== undefined && { baseFare: payload.baseFare }),
        ...(payload.keterangan !== undefined && {
          keterangan: payload.keterangan,
        }),
        ...(payload.statusAktif !== undefined && {
          statusAktif: payload.statusAktif,
        }),
      },
    });
  }

  static async delete(id: number) {
    return prisma.settingTunjanganTransport.delete({ where: { id } });
  }

  static async toggleStatus(id: number) {
    const setting = await prisma.settingTunjanganTransport.findUnique({
      where: { id },
    });
    if (!setting) return null;

    const newStatus =
      setting.statusAktif === StatusAktif.ACTIVE
        ? StatusAktif.NON_ACTIVE
        : StatusAktif.ACTIVE;

    if (newStatus === StatusAktif.ACTIVE) {
      await prisma.settingTunjanganTransport.updateMany({
        where: { statusAktif: StatusAktif.ACTIVE, id: { not: id } },
        data: { statusAktif: StatusAktif.NON_ACTIVE },
      });
    }

    return prisma.settingTunjanganTransport.update({
      where: { id },
      data: { statusAktif: newStatus },
    });
  }
}
