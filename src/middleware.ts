// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Protect /parent (and subpaths) except the login itself
  const isParentArea = pathname.startsWith('/parent');
  const isLoginPath = pathname.startsWith('/parent/login');

  if (isParentArea && !isLoginPath) {
    const authed = req.cookies.get('parent_auth')?.value === 'ok';
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = '/parent/login';
      url.searchParams.set(
        'next',
        pathname + (searchParams.toString() ? `?${searchParams}` : '')
      );
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/parent/:path*'],
};
