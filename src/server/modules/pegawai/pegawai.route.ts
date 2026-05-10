import { Hono } from 'hono';

import { Role } from '@prisma/client';
import { PegawaiController } from './pegawai.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const pegawaiRoute = new Hono();

pegawaiRoute.use('*', authMiddleware);

pegawaiRoute.get('/', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), PegawaiController.index);
pegawaiRoute.get('/export', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), PegawaiController.exportAll);
pegawaiRoute.get('/:id', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), PegawaiController.show);
pegawaiRoute.get('/:id/export', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), PegawaiController.exportOne);
pegawaiRoute.post('/', roleMiddleware(Role.ADMIN_HRD), PegawaiController.create);
pegawaiRoute.put('/:id', roleMiddleware(Role.ADMIN_HRD), PegawaiController.update);
pegawaiRoute.delete('/', roleMiddleware(Role.ADMIN_HRD), PegawaiController.bulkDelete);
pegawaiRoute.delete('/:id', roleMiddleware(Role.ADMIN_HRD), PegawaiController.delete);
pegawaiRoute.patch('/:id/toggle-status', roleMiddleware(Role.ADMIN_HRD), PegawaiController.toggleStatus);

export default pegawaiRoute;
