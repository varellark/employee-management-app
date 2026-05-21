import { AksiLog, Role } from '@prisma/client';
import { Context } from 'hono';
import { ResponseHelper } from '@/server/helpers/response';
import { formatZodError } from '@/server/helpers/zodError';
import { PresensiService } from './presensi.service';
import {
  createPresensiValidation,
  updatePresensiValidation,
} from './presensi.validation';
import { LogService } from '@/server/services/log.service';
import type { AuthPayload } from '@/server/middlewares/auth.middleware';
import {
  buildPresensiTemplateBuffer,
  parsePresensiImport,
} from './presensi.excel';

export class PresensiController {
  static async index(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role === Role.SUPERADMIN) {
        return ResponseHelper.error(
          c,
          'Anda tidak memiliki akses',
          'Forbidden',
          403
        );
      }

      const query = c.req.query();

      const data = await PresensiService.getAll(query);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'PRESENSI',
        keterangan: 'Melihat data presensi',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Data presensi berhasil diambil', data);
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async detail(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role === Role.SUPERADMIN) {
        return ResponseHelper.error(
          c,
          'Anda tidak memiliki akses',
          'Forbidden',
          403
        );
      }

      const pegawaiId = Number(c.req.param('pegawaiId'));

      const month = c.req.query('month');
      const year = c.req.query('year');

      const data = await PresensiService.detail(pegawaiId, month, year);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'PRESENSI',
        keterangan: `Melihat detail presensi pegawai ID ${pegawaiId}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Detail presensi berhasil diambil',
        data
      );
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async create(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.ADMIN_HRD) {
        return ResponseHelper.error(
          c,
          'Anda tidak memiliki akses',
          'Forbidden',
          403
        );
      }

      const body = await c.req.json();

      const validation = createPresensiValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      if (validation.data.lokasiCheckin !== validation.data.lokasiCheckout) {
        return ResponseHelper.error(
          c,
          'Checkin dan checkout harus di lokasi yang sama',
          null,
          422
        );
      }

      const data = await PresensiService.create(validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.CREATE,
        modul: 'PRESENSI',
        keterangan: `Membuat presensi pegawai ID ${data.pegawaiId}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Presensi berhasil dibuat', data, 201);
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async update(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.ADMIN_HRD) {
        return ResponseHelper.error(
          c,
          'Anda tidak memiliki akses',
          'Forbidden',
          403
        );
      }

      const id = Number(c.req.param('id'));

      const body = await c.req.json();

      const validation = updatePresensiValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const data = await PresensiService.update(id, validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'PRESENSI',
        keterangan: `Update presensi ID ${id}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Presensi berhasil diupdate', data);
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async delete(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.ADMIN_HRD) {
        return ResponseHelper.error(
          c,
          'Anda tidak memiliki akses',
          'Forbidden',
          403
        );
      }

      const id = Number(c.req.param('id'));

      await PresensiService.delete(id);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.DELETE,
        modul: 'PRESENSI',
        keterangan: `Menghapus presensi ID ${id}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Presensi berhasil dihapus');
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async downloadTemplate(c: Context) {
    try {
      const month = c.req.query('month') ?? String(new Date().getMonth() + 1).padStart(2, '0');
      const year  = c.req.query('year')  ?? String(new Date().getFullYear());

      const buffer = await buildPresensiTemplateBuffer(month, year);

      const filename = `template-presensi-${year}${month.padStart(2, '0')}.xlsx`;

      c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      c.header('Content-Disposition', `attachment; filename="${filename}"`);
      c.header('Content-Length', String(buffer.byteLength));

      return c.body(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ResponseHelper.error(c, message, null, 500);
    }
  }

  static async importExcel(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.ADMIN_HRD) {
        return ResponseHelper.error(c, 'Anda tidak memiliki akses', 'Forbidden', 403);
      }

      const body = await c.req.parseBody();
      const file  = body['file'];
      const month = String(body['month'] ?? new Date().getMonth() + 1).padStart(2, '0');
      const year  = String(body['year']  ?? new Date().getFullYear());

      if (!file || typeof file === 'string') {
        return ResponseHelper.error(c, 'File Excel wajib diunggah', null, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const { valid, errors } = await parsePresensiImport(arrayBuffer);

      if (valid.length === 0) {
        return ResponseHelper.error(c, 'Tidak ada data valid untuk diimport', errors, 422);
      }

      const results = await PresensiService.importBulk(valid);

      await LogService.create({
        userId:    auth.id,
        username:  auth.username,
        aksi:      AksiLog.CREATE,
        modul:     'PRESENSI',
        keterangan: `Import Excel presensi ${year}-${month}: ${results.created} dibuat, ${results.skipped} dilewati`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Import berhasil diproses', {
        total:   valid.length,
        created: results.created,
        skipped: results.skipped,
        errors,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Import Excel error:', error);
      return ResponseHelper.error(c, message, null, 500);
    }
  }
}
