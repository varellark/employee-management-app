import { Hono } from 'hono';
import { Role } from '@prisma/client';
import { SettingTunjanganController } from './settingTunjangan.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const settingTunjanganRoute = new Hono();

settingTunjanganRoute.use('*', authMiddleware);

settingTunjanganRoute.get('/', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.index);
settingTunjanganRoute.get('/active', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.getActive);
settingTunjanganRoute.get('/:id', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.show);
settingTunjanganRoute.post('/', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.create);
settingTunjanganRoute.put('/:id', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.update);
settingTunjanganRoute.delete('/:id', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.delete);
settingTunjanganRoute.patch('/:id/toggle-status', roleMiddleware(Role.ADMIN_HRD), SettingTunjanganController.toggleStatus);

export default settingTunjanganRoute;