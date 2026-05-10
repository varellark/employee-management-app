import { Hono } from 'hono';

import { LogController } from './log.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '@/server/middlewares/role.middleware';
import { Role } from '@prisma/client';

const logRoute = new Hono();

logRoute.use('*', authMiddleware);

logRoute.get('/', roleMiddleware(Role.SUPERADMIN), LogController.index);

export default logRoute;
