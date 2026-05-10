import { AksiLog, Role } from '@prisma/client';
import { Context } from 'hono';
import { ResponseHelper } from '../../helpers/response';
import { LogService } from '../../services/log.service';
import type { AuthPayload } from '../../middlewares/auth.middleware';
import { DashboardService } from './dashboard.service';

export class DashboardController {
  static async index(c: Context) {
    try {
      const auth = c.get('user') as AuthPayload;

      await LogService.create({
        userId: auth.id,
        username: auth.username,
        aksi: AksiLog.READ,
        modul: 'DASHBOARD',
        keterangan: `Mengakses dashboard (role: ${auth.role})`,
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      if (auth.role === Role.SUPERADMIN) {
        const data = await DashboardService.getSuperadminDashboard(
          auth.username,
          auth.role
        );
        return ResponseHelper.success(c, 'Dashboard berhasil diambil', data);
      }

      if (auth.role === Role.ADMIN_HRD) {
        const data = await DashboardService.getAdminHRDDashboard(
          auth.username,
          auth.role
        );
        return ResponseHelper.success(c, 'Dashboard berhasil diambil', data);
      }

      if (auth.role === Role.MANAGER_HRD) {
        const data = await DashboardService.getManagerHRDDashboard();
        return ResponseHelper.success(c, 'Dashboard berhasil diambil', data);
      }

      return ResponseHelper.error(c, 'Role tidak dikenali', null, 403);
    } catch (error) {
      console.error(error);
      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }
}
