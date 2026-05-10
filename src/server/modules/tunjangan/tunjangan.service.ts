import { Prisma, JenisPegawai, StatusAktif } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Pagination } from '@/server/helpers';
import { hitungTunjangan } from './tunjangan.helper';
import type {
  GenerateTunjanganPayload,
  GetAllTunjanganQuery,
} from './tunjangan.type';

export class TunjanganService {
  static async getAll(query: GetAllTunjanganQuery) {
    const {
      search = '',
      periode,
      pegawaiId,
      sortBy = 'periode',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
      noPagination = 'false',
    } = query;

    const usePagination = noPagination !== 'true';
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const filters: Prisma.TunjanganWhereInput = {
      ...(search
        ? {
            pegawai: {
              OR: [
                { nama: { contains: search, mode: 'insensitive' } },
                { nip: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      ...(periode ? { periode } : {}),
      ...(pegawaiId ? { pegawaiId: parseInt(pegawaiId, 10) } : {}),
    };

    let orderBy: Prisma.TunjanganOrderByWithRelationInput;

    const prismaSortOrder: Prisma.SortOrder =
      sortOrder === 'asc' ? 'asc' : 'desc';

    if (sortBy === 'totalTunjangan') {
      orderBy = { totalTunjangan: prismaSortOrder };
    } else if (sortBy === 'jumlahHariMasuk') {
      orderBy = { jumlahHariMasuk: prismaSortOrder };
    } else if (sortBy === 'pegawai') {
      orderBy = { pegawai: { nama: prismaSortOrder } };
    } else {
      orderBy = { periode: prismaSortOrder };
    }

    const [data, total] = await Promise.all([
      prisma.tunjangan.findMany({
        where: filters,
        include: {
          pegawai: {
            select: {
              id: true,
              nip: true,
              nama: true,
              jabatan: true,
              departemen: true,
            },
          },
        },
        orderBy,
        ...(usePagination
          ? { skip: (pageNumber - 1) * limitNumber, take: limitNumber }
          : {}),
      }),
      prisma.tunjangan.count({ where: filters }),
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
        : { total }),
    };
  }

  static async findById(id: number) {
    return prisma.tunjangan.findUnique({
      where: { id },
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true,
            jabatan: true,
            departemen: true,
            jenisPegawai: true,
          },
        },
      },
    });
  }

  static async rekap(periode: string) {
    const data = await prisma.tunjangan.findMany({
      where: { periode },
      include: {
        pegawai: {
          select: { id: true, nip: true, nama: true, departemen: true },
        },
      },
      orderBy: { pegawai: { nama: 'asc' } },
    });

    const totalKeseluruhan = data.reduce(
      (sum, t) => sum + Number(t.totalTunjangan),
      0
    );

    return { periode, totalPegawai: data.length, totalKeseluruhan, data };
  }

  static async generate(payload: GenerateTunjanganPayload, baseFare: number) {
    const results: {
      pegawaiId: number;
      status:
        | 'created'
        | 'skipped'
        | 'not_eligible'
        | 'not_tetap'
        | 'duplicate';
      alasan?: string;
      tunjangan?: object;
    }[] = [];

    for (const item of payload.data) {
      const pegawai = await prisma.pegawai.findUnique({
        where: { id: item.pegawaiId },
        select: { jenisPegawai: true, statusAktif: true, nama: true },
      });

      if (!pegawai) {
        results.push({
          pegawaiId: item.pegawaiId,
          status: 'skipped',
          alasan: 'Pegawai tidak ditemukan',
        });
        continue;
      }

      if (pegawai.jenisPegawai !== JenisPegawai.TETAP) {
        results.push({
          pegawaiId: item.pegawaiId,
          status: 'not_tetap',
          alasan: `${pegawai.nama} bukan pegawai tetap`,
        });
        continue;
      }

      const existing = await prisma.tunjangan.findUnique({
        where: {
          pegawaiId_periode: {
            pegawaiId: item.pegawaiId,
            periode: payload.periode,
          },
        },
      });

      if (existing) {
        results.push({
          pegawaiId: item.pegawaiId,
          status: 'duplicate',
          alasan: `${pegawai.nama} sudah memiliki tunjangan periode ${payload.periode}`,
        });
        continue;
      }

      const { totalTunjangan, eligible, alasan } = hitungTunjangan(
        baseFare,
        item.jarakKm,
        item.jumlahHariMasuk
      );

      if (!eligible) {
        results.push({
          pegawaiId: item.pegawaiId,
          status: 'not_eligible',
          alasan,
        });
        continue;
      }

      const tunjangan = await prisma.tunjangan.create({
        data: {
          pegawaiId: item.pegawaiId,
          periode: payload.periode,
          jarakKm: item.jarakKm,
          jumlahHariMasuk: item.jumlahHariMasuk,
          baseFare,
          totalTunjangan,
          keterangan: item.keterangan,
        },
        include: {
          pegawai: { select: { id: true, nip: true, nama: true } },
        },
      });

      results.push({ pegawaiId: item.pegawaiId, status: 'created', tunjangan });
    }

    const created = results.filter((r) => r.status === 'created').length;
    const skipped = results.filter((r) => r.status !== 'created').length;

    return { created, skipped, results };
  }
}

export class SettingTunjanganService {
  static async getActive() {
    return prisma.settingTunjanganTransport.findFirst({
      where: { statusAktif: StatusAktif.ACTIVE },
      orderBy: { createDate: 'desc' },
    });
  }
}
