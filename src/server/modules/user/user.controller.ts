import { AksiLog, Role, StatusAktif } from '@prisma/client';
import { Context } from 'hono';
import { ResponseHelper } from '../../helpers/response';
import { formatZodError } from '../../helpers/zodError';
import { UserService } from './user.service';
import { createUserValidation, updateMeValidation, updateUserValidation } from './user.validation';
import { LogService } from '../../services/log.service';
import type { AuthPayload } from '../../middlewares/auth.middleware';
import { MailService } from '@/server/services/mail.service';

export class UserController {
  static async index(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;
      const query = c.req.query();

      const users =
        auth.role === Role.SUPERADMIN
          ? await UserService.getAll(query)
          : {
            data: [await UserService.getByUserId(auth.id)],
            pagination: {
              total: 1,
              totalPages: 1,
              currentPage: 1,
              limit: 1,
            },
          };

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'USER',
        keterangan: 'Melihat data user',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Data user berhasil diambil', users);
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

      const user = await UserService.findById(id);

      if (!user) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      return ResponseHelper.success(c, 'Data user berhasil diambil', user);
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async me(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      const user = await UserService.findById(auth.id);

      if (!user) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      return ResponseHelper.success(c, 'Data profile berhasil diambil', user);
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async create(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.SUPERADMIN) {
        return ResponseHelper.error(
          c,
          'Forbidden',
          'Anda tidak memiliki akses',
          403
        );
      }

      const body = await c.req.json();

      const validation = createUserValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const { pegawaiId, username, role, statusAktif } = validation.data;

      const existingUsername = await UserService.findByUsername(username);

      if (existingUsername) {
        return ResponseHelper.error(c, 'Username sudah digunakan', null, 422);
      }

      const existingPegawaiUser = await UserService.findByPegawaiId(pegawaiId);

      if (existingPegawaiUser) {
        return ResponseHelper.error(
          c,
          'Pegawai sudah memiliki akun user',
          null,
          422
        );
      }

      const pegawai = await UserService.findPegawaiById(pegawaiId);

      if (!pegawai) {
        return ResponseHelper.error(c, 'Pegawai tidak ditemukan', null, 404);
      }

      const { user, plainPassword } = await UserService.create({
        pegawaiId,
        username,
        role,
        statusAktif,
      });

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.CREATE,
        modul: 'USER',
        keterangan: `Membuat user ${user.username}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      setImmediate(() => {
        MailService.sendAccountCreatedEmail({
          to: pegawai.email,
          name: pegawai.nama,
          username,
          password: plainPassword,
        }).catch(console.error);
      });

      return ResponseHelper.success(
        c,
        'User berhasil dibuat',
        {
          user,
          defaultPassword: plainPassword,
        },
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

      const body = await c.req.json();

      const validation = updateUserValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const existingUser = await UserService.findById(id);

      if (!existingUser) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      if (auth.role !== Role.SUPERADMIN && auth.id !== existingUser.id) {
        return ResponseHelper.error(
          c,
          'Forbidden',
          'Anda tidak memiliki akses',
          403
        );
      }

      if (auth.role !== Role.SUPERADMIN) {
        delete validation.data.role;
        delete validation.data.statusAktif;
      }

      if (validation.data.username) {
        const usernameExists = await UserService.findByUsername(
          validation.data.username
        );

        if (usernameExists && usernameExists.id !== id) {
          return ResponseHelper.error(c, 'Username sudah digunakan', null, 422);
        }
      }

      const user = await UserService.update(id, validation.data);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'USER',
        keterangan: `Update user ${user.username}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'User berhasil diupdate', user);
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async delete(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.SUPERADMIN) {
        return ResponseHelper.error(
          c,
          'Forbidden',
          'Anda tidak memiliki akses',
          403
        );
      }

      const id = Number(c.req.param('id'));

      const user = await UserService.findById(id);

      if (!user) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      if (auth.id === user.id) {
        return ResponseHelper.error(
          c,
          'Forbidden',
          'Tidak dapat menghapus akun sendiri',
          403
        );
      }

      await UserService.delete(id);

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.DELETE,
        modul: 'USER',
        keterangan: `Delete user ${user.username}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'User berhasil dihapus');
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async toggleStatus(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      if (auth.role !== Role.SUPERADMIN) {
        return ResponseHelper.error(
          c,
          'Forbidden',
          'Anda tidak memiliki akses',
          403
        );
      }

      const id = Number(c.req.param('id'));

      const user = await UserService.findById(id);

      if (!user) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      if (auth.id === user.id) {
        return ResponseHelper.error(
          c,
          'Forbidden',
          'Tidak dapat mengubah status akun sendiri',
          403
        );
      }

      const statusAktif =
        user.statusAktif === StatusAktif.ACTIVE
          ? StatusAktif.NON_ACTIVE
          : StatusAktif.ACTIVE;

      const updatedUser = await UserService.update(id, {
        statusAktif,
      });

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'USER',
        keterangan: `Mengubah status user ${user.username} menjadi ${statusAktif}`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(
        c,
        'Status user berhasil diubah',
        updatedUser
      );
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async searchPegawai(c: Context) {
    const q = c.req.query('q');

    if (!q || q.length < 2) {
      return ResponseHelper.success(c, 'OK', []);
    }

    const data = await UserService.searchPegawai(q);

    return ResponseHelper.success(c, 'OK', data);
  }

  static async updateMe(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      const formData = await c.req.formData();

      const rawBody = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || undefined,
        password: (formData.get('password') as string) || undefined,
      };

      const validation = updateMeValidation.safeParse(rawBody);
      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const updatedUser = await UserService.updateMe(auth.id, {
        name: validation.data.name,
        email: validation.data.email,
        phone: validation.data.phone,
        password: validation.data.password,
      });

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.UPDATE,
        modul: 'USER',
        keterangan: 'Update profile sendiri',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Profile berhasil diperbarui', updatedUser);
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }
}
