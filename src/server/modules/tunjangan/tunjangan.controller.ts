import { AksiLog, JenisPegawai } from '@prisma/client';
import { Context } from 'hono';
import { ResponseHelper } from '../../helpers/response';
import { formatZodError } from '../../helpers/zodError';
import { TunjanganService, SettingTunjanganService } from './tunjangan.service';
import {
  queryTunjanganValidation,
  hitungTunjanganValidation,
  generateTunjanganValidation,
} from './tunjangan.validation';
import { LogService } from '../../services/log.service';
import type { AuthPayload } from '../../middlewares/auth.middleware';
import { hitungTunjangan } from './tunjangan.helper';
import { buildTunjanganListHtml, TunjanganRow } from '@/server/templates/tunjanganListTemplate';
import { generatePdfFromHtml } from '@/server/helpers/pdfGenerator';
import { TunjanganWithPegawai } from '@/server/modules/tunjangan/tunjangan.type';
import { buildTunjanganDetailHtml, TunjanganDetailRow } from '@/server/templates/tunjanganTemplate';

export class TunjanganController {
  static async index(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const rawQuery = c.req.query();
      const queryParsed = queryTunjanganValidation.safeParse(rawQuery);

      if (!queryParsed.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(queryParsed.error),
          422
        );
      }

      const result = await TunjanganService.getAll(queryParsed.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'TUNJANGAN',
        keterangan: 'Melihat daftar tunjangan transport',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Data tunjangan berhasil diambil',
        result
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async show(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));
      if (isNaN(id))
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);

      const tunjangan = await TunjanganService.findById(id);
      if (!tunjangan)
        return ResponseHelper.error(c, 'Tunjangan tidak ditemukan', null, 404);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'TUNJANGAN',
        keterangan: `Melihat detail tunjangan ID ${id}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Detail tunjangan berhasil diambil',
        tunjangan
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async rekap(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const periode = c.req.query('periode');

      if (!periode || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periode)) {
        return ResponseHelper.error(
          c,
          'Parameter periode wajib diisi dengan format YYYY-MM',
          null,
          422
        );
      }

      const result = await TunjanganService.rekap(periode);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'TUNJANGAN',
        keterangan: `Melihat rekap tunjangan periode ${periode}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        `Rekap tunjangan periode ${periode}`,
        result
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async hitung(c: Context) {
    try {
      const body = await c.req.json();
      const validation = hitungTunjanganValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const pegawai = await import('../../lib/prisma').then(({ prisma }) =>
        prisma.pegawai.findUnique({
          where: { id: validation.data.pegawaiId },
          select: { jenisPegawai: true, nama: true },
        })
      );

      if (!pegawai)
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);

      if (pegawai.jenisPegawai !== JenisPegawai.TETAP) {
        return ResponseHelper.error(
          c,
          `${pegawai.nama} bukan pegawai tetap, tidak berhak mendapat tunjangan transport`,
          null,
          422
        );
      }

      const setting = await SettingTunjanganService.getActive();
      if (!setting) {
        return ResponseHelper.error(
          c,
          'Belum ada setting tunjangan transport yang aktif',
          null,
          422
        );
      }

      const result = hitungTunjangan(
        Number(setting.baseFare),
        validation.data.jarakKm,
        validation.data.jumlahHariMasuk
      );

      return ResponseHelper.success(c, 'Simulasi perhitungan tunjangan', {
        ...result,
        baseFare: Number(setting.baseFare),
        jarakKm: validation.data.jarakKm,
        jumlahHariMasuk: validation.data.jumlahHariMasuk,
        pegawai: { id: validation.data.pegawaiId, nama: pegawai.nama },
      });
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async generate(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const body = await c.req.json();
      const validation = generateTunjanganValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const setting = await SettingTunjanganService.getActive();
      if (!setting) {
        return ResponseHelper.error(
          c,
          'Belum ada setting tunjangan transport yang aktif',
          null,
          422
        );
      }

      const result = await TunjanganService.generate(
        validation.data,
        Number(setting.baseFare)
      );

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.CREATE,
        modul: 'TUNJANGAN',
        keterangan: `Generate tunjangan periode ${validation.data.periode}: ${result.created} berhasil, ${result.skipped} dilewati`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Generate tunjangan selesai',
        result,
        201
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async exportAll(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const rawQuery = c.req.query();
      const queryParsed = queryTunjanganValidation.safeParse({
        ...rawQuery,
        noPagination: 'true',
      });

      if (!queryParsed.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(queryParsed.error),
          422
        );
      }

      const result = await TunjanganService.getAll({
        ...queryParsed.data,
        noPagination: 'true',
      });

      const html = buildTunjanganListHtml(
        (result.data as TunjanganWithPegawai[]).map((t) => ({
          ...t,
          jarakKm: t.jarakKm.toString(),
          baseFare: t.baseFare.toString(),
          totalTunjangan: t.totalTunjangan.toString(),
          keterangan: t.keterangan ?? undefined,
          pegawai: {
            ...t.pegawai,
            departemen: t.pegawai.departemen ?? undefined,
          },
        })) satisfies TunjanganRow[]
      );
      const pdfBuffer = await generatePdfFromHtml(html);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const filename = `laporan-tunjangan-${timestamp}.pdf`;

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'TUNJANGAN',
        keterangan: 'Export PDF laporan tunjangan',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      c.header('Content-Type', 'application/pdf');
      c.header('Content-Disposition', `attachment; filename="${filename}"`);
      c.header('Content-Length', String(pdfBuffer.length));

      return c.body(pdfBuffer.buffer as ArrayBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Export PDF tunjangan error:', error);
      return ResponseHelper.error(c, message, null, 500);
    }
  }

  static async exportOne(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));

      if (isNaN(id)) {
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);
      }

      const tunjangan = await TunjanganService.findById(id);

      if (!tunjangan) {
        return ResponseHelper.error(c, 'Tunjangan tidak ditemukan', null, 404);
      }

      const row: TunjanganDetailRow = {
        ...tunjangan,
        jarakKm: tunjangan.jarakKm.toString(),
        baseFare: tunjangan.baseFare.toString(),
        totalTunjangan: tunjangan.totalTunjangan.toString(),
        keterangan: tunjangan.keterangan ?? undefined,
        pegawai: {
          ...tunjangan.pegawai,
          departemen: tunjangan.pegawai.departemen ?? undefined,
        },
      };

      const html = buildTunjanganDetailHtml(row);
      const pdfBuffer = await generatePdfFromHtml(html);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const safeName = tunjangan.pegawai.nama.replace(/\s+/g, '-').toLowerCase();
      const filename = `tunjangan-${safeName}-${tunjangan.periode}-${timestamp}.pdf`;

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'TUNJANGAN',
        keterangan: `Export PDF tunjangan ${tunjangan.pegawai.nama} periode ${tunjangan.periode}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      c.header('Content-Type', 'application/pdf');
      c.header('Content-Disposition', `attachment; filename="${filename}"`);
      c.header('Content-Length', String(pdfBuffer.length));

      return c.body(pdfBuffer.buffer as ArrayBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Export PDF tunjangan error:', error);
      return ResponseHelper.error(c, message, null, 500);
    }
  }
}
