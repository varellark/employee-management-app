import { Hono } from 'hono';
import { Role } from '@prisma/client';
import { TunjanganController } from './tunjangan.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const tunjanganRoute = new Hono();

tunjanganRoute.use('*', authMiddleware);

tunjanganRoute.get('/', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), TunjanganController.index);
tunjanganRoute.get('/export', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), TunjanganController.exportAll);
tunjanganRoute.get('/rekap', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), TunjanganController.rekap);
tunjanganRoute.get('/:id', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), TunjanganController.show);
tunjanganRoute.get('/:id/export', roleMiddleware(Role.MANAGER_HRD, Role.ADMIN_HRD), TunjanganController.exportOne);
tunjanganRoute.post('/hitung', roleMiddleware(Role.ADMIN_HRD), TunjanganController.hitung);
tunjanganRoute.post('/generate', roleMiddleware(Role.ADMIN_HRD), TunjanganController.generate);

export default tunjanganRoute;