import { Prisma } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { Pagination } from '@/server/helpers';
import { GetAllPayload } from './log.type';

export class LogService {
  static async getAll(query: GetAllPayload) {
    const {
      search = '',
      username,
      modul,
      aksi,
      startDate,
      endDate,
      page = '1',
      limit = '10',
      noPagination = 'false',
    } = query;

    const usePagination = noPagination !== 'true';

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const usernameFilter = Array.isArray(username)
      ? username
      : username
        ? username.split(',')
        : [];

    const modulFilter = Array.isArray(modul)
      ? modul
      : modul
        ? modul.split(',')
        : [];

    const filters: Prisma.LogWhereInput = {
      ...(search
        ? {
            OR: [
              {
                username: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                modul: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),

      ...(usernameFilter.length > 0
        ? {
            username: {
              in: usernameFilter,
            },
          }
        : {}),

      ...(modulFilter.length > 0
        ? {
            modul: {
              in: modulFilter,
            },
          }
        : {}),

      ...(aksi
        ? {
            aksi,
          }
        : {}),

      ...(startDate || endDate
        ? {
            createDate: {
              ...(startDate
                ? {
                    gte: new Date(startDate),
                  }
                : {}),

              ...(endDate
                ? {
                    lte: new Date(endDate),
                  }
                : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where: filters,

        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,

              pegawai: {
                select: {
                  nama: true,
                },
              },
            },
          },
        },

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

      prisma.log.count({
        where: filters,
      }),
    ]);

    return {
      data: logs,

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
}
