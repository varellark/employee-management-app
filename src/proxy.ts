import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = new Set(['/login']);

const roleAccessMap: Record<string, string[]> = {
  SUPERADMIN: ['/dashboard', '/users', '/logs', '/profile'],

  MANAGER_HRD: ['/dashboard', '/pegawai', '/tunjangan', '/profile', '/presensi'],

  ADMIN_HRD: [
    '/dashboard',
    '/pegawai',
    '/tunjangan',
    '/setting-tunjangan',
    '/presensi',
    '/profile',
  ],
};

const blockedSubPaths: Record<string, string[]> = {
  MANAGER_HRD: [
    '/pegawai/add',
    '/pegawai/edit',
  ],
};

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const { pathname } = req.nextUrl;
  const cleanPath = pathname.toLowerCase().replace(/\/$/, '') || '/';

  if (
    cleanPath.startsWith('/_next') ||
    cleanPath.startsWith('/api') ||
    cleanPath === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  if (!token && !publicRoutes.has(cleanPath)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && publicRoutes.has(cleanPath)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (token) {
    if (cleanPath === '/unauthorized') {
      return NextResponse.next();
    }

    const payload = await verifyToken(token);

    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('auth_token');
      return response;
    }

    const role = String(payload.role).toUpperCase();

    const blocked = blockedSubPaths[role] ?? [];
    const isBlocked = blocked.some(
      (blockedPath) =>
        cleanPath === blockedPath || cleanPath.startsWith(`${blockedPath}/`)
    );

    if (isBlocked) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    const allowedPaths = roleAccessMap[role] ?? [];
    const isAllowed = allowedPaths.some(
      (basePath) =>
        cleanPath === basePath || cleanPath.startsWith(`${basePath}/`)
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/users/:path*',
    '/pegawai/:path*',
    '/tunjangan/:path*',
    '/setting-tunjangan/:path*',
    '/presensi/:path*',
    '/logs/:path*',
    '/profile/:path*',
    '/unauthorized',
  ],
};
