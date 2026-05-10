import { Role } from '@prisma/client';

import { createMiddleware } from 'hono/factory';
import { ResponseHelper } from '../helpers/response';
import type { AuthPayload } from './auth.middleware';

export const roleMiddleware = (...roles: Role[]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user') as AuthPayload;

    if (!user) {
      return ResponseHelper.error(c, 'Unauthorized', 'User not found', 401);
    }

    const hasAccess = roles.includes(user.role as Role);

    if (!hasAccess) {
      return ResponseHelper.error(c, 'Forbidden', 'Access denied', 403);
    }

    await next();
  });
};
