import { Hono } from 'hono';
import { Role } from '@prisma/client';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';

const dashboardRoute = new Hono();

dashboardRoute.use('*', authMiddleware);

dashboardRoute.get('/', roleMiddleware(Role.SUPERADMIN, Role.MANAGER_HRD, Role.ADMIN_HRD), DashboardController.index);

export default dashboardRoute;
