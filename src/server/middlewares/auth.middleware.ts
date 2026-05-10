import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';
import { Role, StatusAktif } from '@prisma/client';
import { ResponseHelper } from '../helpers/response';
import { prisma } from '../lib/prisma';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export type AuthPayload = {
  id: number;
  username: string;
  role: Role;
  pegawaiId: number;
  iat?: number;
  exp?: number;
};

export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    const authorization = c.req.header('Authorization');

    if (!authorization) {
      return ResponseHelper.error(c, 'Unauthorized', 'Token not found', 401);
    }

    const bearerToken = authorization.startsWith('Bearer ');

    if (!bearerToken) {
      return ResponseHelper.error(
        c,
        'Unauthorized',
        'Invalid token format',
        401
      );
    }

    const token = authorization.split(' ')[1];

    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: {
        id: Number(payload.id),
      },
      select: {
        id: true,
        username: true,
        role: true,
        pegawaiId: true,
        statusAktif: true,
      },
    });

    if (!user) {
      return ResponseHelper.error(
        c,
        'Unauthorized',
        'User tidak ditemukan',
        401
      );
    }

    if (user.statusAktif === StatusAktif.NON_ACTIVE) {
      return ResponseHelper.error(c, 'Unauthorized', 'User nonaktif', 401);
    }

    c.set('user', {
      id: user.id,
      username: user.username,
      role: user.role,
      pegawaiId: user.pegawaiId,
    } satisfies AuthPayload);

    await next();
  } catch {
    return ResponseHelper.error(
      c,
      'Unauthorized',
      'Token invalid or expired',
      401
    );
  }
});
