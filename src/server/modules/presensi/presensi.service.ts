import {
  LokasiGedung,
  Prisma,
  StatusKehadiran,
  StatusVerifikasi,
  Verifikator,
} from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { Pagination } from '@/server/helpers';
import { determineStatus } from '@/server/helpers/presensi';
import type { CreatePayload, GetAllPayload } from './presensi.type';
import { PresensiImportRow } from '@/server/modules/presensi/presensi.excel';

export class PresensiService {
  static async getAll(query: GetAllPayload) {
    const {
      search = '',
      month,
      year,
      statusKehadiran,
      page = '1',
      limit = '10',
      noPagination = 'false',
    } = query;

    const usePagination = noPagination !== 'true';
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const now = new Date();
    const defaultMonth = now.getMonth();
    const defaultYear = now.getFullYear();
    const selectedMonth = month ? parseInt(month, 10) - 1 : defaultMonth - 1;
    const selectedYear = year ? parseInt(year, 10) : defaultYear;
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    const filters: Prisma.PegawaiWhereInput = {
      ...(search
        ? {
            OR: [
              {
                nama: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                nip: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [pegawai, total] = await Promise.all([
      prisma.pegawai.findMany({
        where: filters,

        include: {
          presensi: {
            where: {
              tanggal: {
                gte: startDate,
                lte: endDate,
              },

              ...(statusKehadiran
                ? {
                    statusKehadiran,
                  }
                : {}),
            },
          },
        },

        ...(usePagination
          ? {
              skip: (pageNumber - 1) * limitNumber,
              take: limitNumber,
            }
          : {}),

        orderBy: {
          nama: 'asc',
        },
      }),

      prisma.pegawai.count({
        where: filters,
      }),
    ]);

    const data = await Promise.all(
      pegawai.map(async (item) => {
        const kuota = await prisma.kuotaAbsensi.findFirst({
          where: {
            pegawaiId: item.id,
            tahun: selectedYear,
          },
        });

        const hadir = item.presensi.filter(
          (x) => x.statusKehadiran === 'HADIR'
        );
        const cuti = item.presensi.filter((x) => x.statusKehadiran === 'CUTI');
        const izin = item.presensi.filter((x) => x.statusKehadiran === 'IZIN');
        const unpaid = item.presensi.filter(
          (x) => x.statusKehadiran === 'UNPAID_LEAVE'
        );

        return {
          id: item.id,
          nip: item.nip,
          nama: item.nama,
          jabatan: item.jabatan,
          hadir: hadir.length,
          statusHadir: hadir.every((x) => x.statusTerpenuhi)
            ? 'TERPENUHI'
            : 'TIDAK_TERPENUHI',
          cuti: cuti.length,
          kuotaCuti: kuota?.sisaCuti ?? 0,
          izin: izin.length,
          kuotaIzin: kuota?.sisaIzin ?? 0,
          unpaidLeave: unpaid.length,
          kuotaUnpaidLeave: kuota?.sisaUnpaid ?? 0,
        };
      })
    );

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

  static async detail(pegawaiId: number, month?: string, year?: string) {
    const now = new Date();
    const defaultMonth = now.getMonth();
    const defaultYear = now.getFullYear();
    const selectedMonth = month ? parseInt(month, 10) - 1 : defaultMonth - 1;
    const selectedYear = year ? parseInt(year, 10) : defaultYear;
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    return prisma.presensi.findMany({
      where: {
        pegawaiId,
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },

      include: {
        pegawai: true,
      },

      orderBy: {
        tanggal: 'desc',
      },
    });
  }

  static async create(payload: CreatePayload) {
    const checkin = new Date(payload.waktuCheckin);
    const checkout = new Date(payload.waktuCheckout);
    const rules = determineStatus(checkin, checkout);

    return prisma.presensi.create({
      data: {
        pegawaiId: payload.pegawaiId,
        tanggal: new Date(payload.tanggal),
        lokasiCheckin: payload.lokasiCheckin,
        lokasiCheckout: payload.lokasiCheckout,
        waktuCheckin: checkin,
        waktuCheckout: checkout,
        durasi: rules.duration,
        statusKehadiran: payload.statusKehadiran,
        statusTerpenuhi: rules.statusTerpenuhi,
        isHalfday: rules.isHalfday,
        statusVerifikasi: payload.statusVerifikasi ?? 'PENDING',
        verifikator: payload.verifikator,
        keterangan: payload.keterangan,
      },
    });
  }

  static async update(id: number, payload: Partial<CreatePayload>) {
    return prisma.presensi.update({
      where: {
        id,
      },

      data: payload,
    });
  }

  static async delete(id: number) {
    return prisma.presensi.delete({
      where: {
        id,
      },
    });
  }

  static async importBulk(
    rows: PresensiImportRow[]
  ): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;

    for (const row of rows) {
      const pegawai = await prisma.pegawai.findUnique({
        where: { nip: row.nip },
      });
      if (!pegawai) {
        skipped++;
        continue;
      }

      const tanggal = new Date(row.tanggal);

      const buildTime = (base: Date, hhmm?: string): Date | undefined => {
        if (!hhmm) return undefined;
        const [hh, mm] = hhmm.split(':').map(Number);
        const d = new Date(base);
        d.setHours(hh, mm, 0, 0);
        return d;
      };

      const waktuCheckin = buildTime(tanggal, row.waktuCheckin);
      const waktuCheckout = buildTime(tanggal, row.waktuCheckout);

      let durasi: number | undefined;
      let statusTerpenuhi = false;
      let isHalfday = false;

      if (waktuCheckin && waktuCheckout) {
        durasi = Math.floor(
          (waktuCheckout.getTime() - waktuCheckin.getTime()) / 60000
        );
        statusTerpenuhi = durasi >= 480;
        isHalfday = durasi >= 240 && durasi < 480;
      }

      try {
        await prisma.presensi.upsert({
          where: { pegawaiId_tanggal: { pegawaiId: pegawai.id, tanggal } },
          update: {
            lokasiCheckin: (row.lokasiCheckin as LokasiGedung) ?? null,
            lokasiCheckout: (row.lokasiCheckout as LokasiGedung) ?? null,
            waktuCheckin: waktuCheckin ?? null,
            waktuCheckout: waktuCheckout ?? null,
            durasi: durasi ?? null,
            statusKehadiran: row.statusKehadiran as StatusKehadiran,
            statusTerpenuhi,
            isHalfday,
            statusVerifikasi:
              (row.statusVerifikasi as StatusVerifikasi) ?? 'PENDING',
            verifikator: (row.verifikator as Verifikator) ?? null,
            keterangan: row.keterangan ?? null,
          },
          create: {
            pegawaiId: pegawai.id,
            tanggal,
            lokasiCheckin: (row.lokasiCheckin as LokasiGedung) ?? null,
            lokasiCheckout: (row.lokasiCheckout as LokasiGedung) ?? null,
            waktuCheckin: waktuCheckin ?? null,
            waktuCheckout: waktuCheckout ?? null,
            durasi: durasi ?? null,
            statusKehadiran: row.statusKehadiran as StatusKehadiran,
            statusTerpenuhi,
            isHalfday,
            statusVerifikasi:
              (row.statusVerifikasi as StatusVerifikasi) ?? 'PENDING',
            verifikator: (row.verifikator as Verifikator) ?? null,
            keterangan: row.keterangan ?? null,
          },
        });
        created++;
      } catch {
        skipped++;
      }
    }

    return { created, skipped };
  }
}
