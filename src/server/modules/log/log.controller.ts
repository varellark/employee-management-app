import { Context } from 'hono';
import { ResponseHelper } from '@/server/helpers/response';
import { LogService } from './log.service';

export class LogController {
  static async index(c: Context) {
    try {
      const query = c.req.query();

      const logs = await LogService.getAll(query);

      return ResponseHelper.success(c, 'Data log berhasil diambil', logs);
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }
}
