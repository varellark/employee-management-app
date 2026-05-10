import { Context } from 'hono';
import { ResponseHelper } from '../../helpers/response';
import { prisma } from '../../lib/prisma';

export class WilayahController {
  static async getProvinsi(c: Context) {
    try {
      const q = c.req.query('q') || '';

      const data = await prisma.provinsi.findMany({
        where: q ? { nama: { contains: q, mode: 'insensitive' } } : undefined,
        select: { id: true, kode: true, nama: true },
        orderBy: { nama: 'asc' },
      });

      return ResponseHelper.success(c, 'OK', data);
    } catch (error) {
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async getKabupaten(c: Context) {
    try {
      const provinsiId = c.req.query('provinsiId');
      const q = c.req.query('q') || '';

      const data = await prisma.kabupaten.findMany({
        where: {
          ...(provinsiId ? { provinsiId: Number(provinsiId) } : {}),
          ...(q ? { nama: { contains: q, mode: 'insensitive' } } : {}),
        },
        select: {
          id: true,
          kode: true,
          nama: true,
          provinsiId: true,
          provinsi: { select: { id: true, nama: true } },
        },
        orderBy: { nama: 'asc' },
      });

      return ResponseHelper.success(c, 'OK', data);
    } catch (error) {
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async getKecamatan(c: Context) {
    try {
      const kabupatenId = c.req.query('kabupatenId');
      const q = c.req.query('q') || '';

      if (!kabupatenId) {
        return ResponseHelper.error(c, 'kabupatenId wajib diisi', null, 400);
      }

      const data = await prisma.kecamatan.findMany({
        where: {
          kabupatenId: Number(kabupatenId),
          ...(q ? { nama: { contains: q, mode: 'insensitive' } } : {}),
        },
        select: {
          id: true,
          kode: true,
          nama: true,
          kabupatenId: true,
          kabupaten: {
            select: {
              id: true,
              nama: true,
              provinsiId: true,
              provinsi: { select: { id: true, nama: true } },
            },
          },
        },
        orderBy: { nama: 'asc' },
      });

      return ResponseHelper.success(c, 'OK', data);
    } catch (error) {
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async getKalurahan(c: Context) {
    try {
      const kecamatanId = c.req.query('kecamatanId');
      const q = c.req.query('q') || '';

      if (!kecamatanId) {
        return ResponseHelper.error(c, 'kecamatanId wajib diisi', null, 400);
      }

      const data = await prisma.kalurahan.findMany({
        where: {
          kecamatanId: Number(kecamatanId),
          ...(q ? { nama: { contains: q, mode: 'insensitive' } } : {}),
        },
        select: { id: true, kode: true, nama: true, kecamatanId: true },
        orderBy: { nama: 'asc' },
      });

      return ResponseHelper.success(c, 'OK', data);
    } catch (error) {
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async searchKabupaten(c: Context) {
    try {
      const q = c.req.query('q') || '';

      if (q.length < 2) {
        return ResponseHelper.success(c, 'OK', []);
      }

      const data = await prisma.kabupaten.findMany({
        where: {
          nama: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          nama: true,
          provinsi: { select: { id: true, nama: true } },
        },
        orderBy: { nama: 'asc' },
        take: 10,
      });

      return ResponseHelper.success(c, 'OK', data);
    } catch (error) {
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }
}
