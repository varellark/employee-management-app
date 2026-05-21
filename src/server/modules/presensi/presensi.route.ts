import { Hono } from 'hono';

import { authMiddleware } from '@/server/middlewares/auth.middleware';
import { PresensiController } from './presensi.controller';

const presensiRoute = new Hono();

presensiRoute.use('*', authMiddleware);

presensiRoute.get('/', PresensiController.index);
presensiRoute.get('/:pegawaiId/detail', PresensiController.detail);
presensiRoute.post('/', PresensiController.create);
presensiRoute.put('/:id', PresensiController.update);
presensiRoute.delete('/:id', PresensiController.delete);
presensiRoute.get('/template', PresensiController.downloadTemplate);
presensiRoute.post('/import',  PresensiController.importExcel);

export default presensiRoute;
