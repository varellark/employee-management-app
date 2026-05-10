import { AksiLog } from '@prisma/client';
import { Context } from 'hono';
import { ResponseHelper } from '../../helpers/response';
import { formatZodError } from '../../helpers/zodError';
import { SettingTunjanganService } from './settingTunjangan.service';
import {
  createSettingValidation,
  updateSettingValidation,
  querySettingValidation,
} from './settingTunjangan.validation';
import { LogService } from '../../services/log.service';
import type { AuthPayload } from '../../middlewares/auth.middleware';

export class SettingTunjanganController {
  static async index(c: Context) {
    try {
      const rawQuery = c.req.query();
      const queryParsed = querySettingValidation.safeParse(rawQuery);

      if (!queryParsed.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(queryParsed.error),
          422
        );
      }

      const result = await SettingTunjanganService.getAll(queryParsed.data);
      return ResponseHelper.success(
        c,
        'Data setting tunjangan berhasil diambil',
        result
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async getActive(c: Context) {
    try {
      const setting = await SettingTunjanganService.getActive();
      if (!setting) {
        return ResponseHelper.error(
          c,
          'Belum ada setting tunjangan transport yang aktif',
          null,
          404
        );
      }
      return ResponseHelper.success(c, 'Setting tunjangan aktif', setting);
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async show(c: Context) {
    try {
      const id = Number(c.req.param('id'));
      if (isNaN(id))
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);

      const setting = await SettingTunjanganService.findById(id);
      if (!setting)
        return ResponseHelper.error(c, 'Setting tidak ditemukan', null, 404);

      return ResponseHelper.success(c, 'Detail setting tunjangan', setting);
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async create(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const body = await c.req.json();
      const validation = createSettingValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const setting = await SettingTunjanganService.create(validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.CREATE,
        modul: 'SETTING_TUNJANGAN',
        keterangan: `Menambahkan setting tunjangan transport base fare Rp${validation.data.baseFare}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Setting tunjangan berhasil ditambahkan',
        setting,
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
      if (isNaN(id))
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);

      const existing = await SettingTunjanganService.findById(id);
      if (!existing)
        return ResponseHelper.error(c, 'Setting tidak ditemukan', null, 404);

      const body = await c.req.json();
      const validation = updateSettingValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const setting = await SettingTunjanganService.update(id, validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'SETTING_TUNJANGAN',
        keterangan: `Mengubah setting tunjangan transport ID ${id}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Setting tunjangan berhasil diperbarui',
        setting
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
      if (isNaN(id))
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);

      const existing = await SettingTunjanganService.findById(id);
      if (!existing)
        return ResponseHelper.error(c, 'Setting tidak ditemukan', null, 404);

      await SettingTunjanganService.delete(id);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.DELETE,
        modul: 'SETTING_TUNJANGAN',
        keterangan: `Menghapus setting tunjangan transport ID ${id}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Setting tunjangan berhasil dihapus');
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async toggleStatus(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const id = Number(c.req.param('id'));
      if (isNaN(id))
        return ResponseHelper.error(c, 'ID tidak valid', null, 400);

      const updated = await SettingTunjanganService.toggleStatus(id);
      if (!updated)
        return ResponseHelper.error(c, 'Setting tidak ditemukan', null, 404);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'SETTING_TUNJANGAN',
        keterangan: `Mengubah status setting tunjangan ID ${id} menjadi ${updated.statusAktif}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Status setting tunjangan berhasil diubah',
        updated
      );
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }
}
