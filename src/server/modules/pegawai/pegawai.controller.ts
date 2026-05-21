import { AksiLog, Role, StatusAktif } from '@prisma/client';
import { Context } from 'hono';
import { ResponseHelper } from '../../helpers/response';
import { formatZodError } from '../../helpers/zodError';
import { PegawaiService } from './pegawai.service';
import {
  createPegawaiValidation,
  queryPegawaiValidation,
  updatePegawaiValidation,
} from './pegawai.validation';
import { LogService } from '../../services/log.service';
import type { AuthPayload } from '../../middlewares/auth.middleware';
import { buildPegawaiListHtml } from '@/server/templates/pegawaiListTemplate';
import { generatePdfFromHtml } from '@/server/helpers/pdfGenerator';
import type { PegawaiRow } from '@/server/templates/pegawaiListTemplate';
import { buildPegawaiDetailHtml, PegawaiDetailRow } from '@/server/templates/pegawaiTemplate';

export class PegawaiController {
  static async index(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const rawQuery = c.req.query();

      const queryParsed = queryPegawaiValidation.safeParse(rawQuery);
      if (!queryParsed.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(queryParsed.error),
          422
        );
      }

      const result = await PegawaiService.getAll(queryParsed.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'PEGAWAI',
        keterangan: 'Melihat daftar pegawai',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Data pegawai berhasil diambil', result);
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async show(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));

      if (isNaN(id)) {
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);
      }

      const pegawai = await PegawaiService.findById(id);

      if (!pegawai) {
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);
      }

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'PEGAWAI',
        keterangan: `Melihat detail pegawai ${pegawai.nama}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Detail pegawai berhasil diambil',
        pegawai
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async create(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const body = await c.req.json();
      const validation = createPegawaiValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const existingNip = await PegawaiService.findByNip(validation.data.nip);
      if (existingNip) {
        return ResponseHelper.error(c, 'NIP sudah digunakan', null, 422);
      }

      const existingEmail = await PegawaiService.findByEmail(
        validation.data.email
      );
      if (existingEmail) {
        return ResponseHelper.error(c, 'Email sudah digunakan', null, 422);
      }

      const pegawai = await PegawaiService.create(validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.CREATE,
        modul: 'PEGAWAI',
        keterangan: `Menambahkan pegawai ${pegawai.nama} (NIP: ${pegawai.nip})`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Pegawai berhasil ditambahkan',
        pegawai,
        201
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async update(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));
      if (isNaN(id)) {
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);
      }

      const body = await c.req.json();
      const validation = updatePegawaiValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const existing = await PegawaiService.findById(id);
      if (!existing) {
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);
      }

      if (validation.data.nip) {
        const existingNip = await PegawaiService.findByNip(validation.data.nip);
        if (existingNip && existingNip.id !== id) {
          return ResponseHelper.error(c, 'NIP sudah digunakan', null, 422);
        }
      }

      if (validation.data.email) {
        const existingEmail = await PegawaiService.findByEmail(
          validation.data.email
        );
        if (existingEmail && existingEmail.id !== id) {
          return ResponseHelper.error(c, 'Email sudah digunakan', null, 422);
        }
      }

      const pegawai = await PegawaiService.update(id, validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'PEGAWAI',
        keterangan: `Mengubah data pegawai ${pegawai.nama} (NIP: ${pegawai.nip})`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Data pegawai berhasil diperbarui',
        pegawai
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async delete(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));
      if (isNaN(id)) {
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);
      }

      const pegawai = await PegawaiService.findById(id);
      if (!pegawai) {
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);
      }

      if (pegawai.user?.role === Role.SUPERADMIN) {
        return ResponseHelper.error(
          c,
          'Tidak dapat menghapus pegawai superadmin.',
          'Forbidden',
          403
        );
      }

      if (pegawai.user) {
        return ResponseHelper.error(
          c,
          'Tidak dapat menghapus pegawai yang memiliki akun user aktif.',
          null,
          422
        );
      }

      await PegawaiService.delete(id);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.DELETE,
        modul: 'PEGAWAI',
        keterangan: `Menghapus pegawai ${pegawai.nama} (NIP: ${pegawai.nip})`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Pegawai berhasil dihapus');
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async bulkDelete(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const body = await c.req.json();
      const ids: number[] = body.ids;

      if (!Array.isArray(ids) || ids.length === 0) {
        return ResponseHelper.error(
          c,
          'ids harus berupa array tidak kosong',
          'IDs tidak valid',
          422
        );
      }

      const invalidIds = ids.filter((id) => isNaN(Number(id)));
      if (invalidIds.length > 0) {
        return ResponseHelper.error(
          c,
          `ID berikut tidak valid: ${invalidIds.join(', ')}`,
          'IDs tidak valid',
          422
        );
      }

      const numericIds = ids.map(Number);

      const pegawaiList = await PegawaiService.findManyByIds(numericIds);
      const withUser = pegawaiList.filter((p) => p.user);
      if (withUser.length > 0) {
        return ResponseHelper.error(
          c,
          `Hapus user terlebih dahulu untuk: ${withUser.map((p) => p.nama).join(', ')}`,
          'Beberapa pegawai memiliki akun user aktif',
          422
        );
      }

      const superadminPegawai = pegawaiList.filter(
        (p) => p.user?.role === Role.SUPERADMIN
      );
      if (superadminPegawai.length > 0) {
        return ResponseHelper.error(
          c,
          `Tidak dapat menghapus pegawai superadmin: ${superadminPegawai.map((p) => p.nama).join(', ')}`,
          'Forbidden',
          403
        );
      }

      await PegawaiService.bulkDelete(numericIds);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.DELETE,
        modul: 'PEGAWAI',
        keterangan: `Menghapus ${numericIds.length} pegawai sekaligus (ID: ${numericIds.join(', ')})`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        `${numericIds.length} pegawai berhasil dihapus`
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async toggleStatus(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));
      if (isNaN(id)) {
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);
      }

      const pegawai = await PegawaiService.findById(id);
      if (!pegawai) {
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);
      }

      const statusAktif =
        pegawai.statusAktif === StatusAktif.ACTIVE
          ? StatusAktif.NON_ACTIVE
          : StatusAktif.ACTIVE;

      const updated = await PegawaiService.update(id, { statusAktif });

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'PEGAWAI',
        keterangan: `Mengubah status pegawai ${pegawai.nama} menjadi ${statusAktif}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Status pegawai berhasil diubah',
        updated
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

      const queryParsed = queryPegawaiValidation.safeParse({
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

      const result = await PegawaiService.getAll({
        ...queryParsed.data,
        noPagination: 'true',
      });

      const html = buildPegawaiListHtml(result.data as PegawaiRow[]);
      const pdfBuffer = await generatePdfFromHtml(html);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const filename = `daftar-pegawai-${timestamp}.pdf`;

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'PEGAWAI',
        keterangan: 'Export PDF daftar pegawai',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      c.header('Content-Type', 'application/pdf');
      c.header('Content-Disposition', `attachment; filename="${filename}"`);
      c.header('Content-Length', String(pdfBuffer.length));

      return c.body(pdfBuffer.buffer as ArrayBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Export PDF error:', error);
      return ResponseHelper.error(c, message, null, 500); // ← tampilkan message asli
    }
  }

  static async exportOne(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));

      if (isNaN(id)) {
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);
      }

      const pegawai = await PegawaiService.findById(id);

      if (!pegawai) {
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);
      }

      const html = buildPegawaiDetailHtml(pegawai as PegawaiDetailRow);
      const pdfBuffer = await generatePdfFromHtml(html);

      const timestamp = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      const safeName = pegawai.nama.replace(/\s+/g, '-').toLowerCase();
      const filename = `pegawai-${safeName}-${timestamp}.pdf`;

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'PEGAWAI',
        keterangan: `Export PDF data pegawai ${pegawai.nama}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      c.header('Content-Type', 'application/pdf');
      c.header('Content-Disposition', `attachment; filename="${filename}"`);
      c.header('Content-Length', String(pdfBuffer.length));

      return c.body(pdfBuffer.buffer as ArrayBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Export PDF error:', error);
      return ResponseHelper.error(c, message, null, 500);
    }
  }
}
