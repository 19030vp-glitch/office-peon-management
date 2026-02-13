import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that don't require authentication
    const publicPaths = ['/login', '/api/auth/login', '/_next', '/favicon.ico'];

    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        // Role-based redirect logic
        if (pathname.startsWith('/dashboard/employee') && role !== 'employee') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }
        if (pathname.startsWith('/dashboard/peon') && role !== 'peon') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }
        if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }

        // Redirect root to specific dashboard
        if (pathname === '/' || pathname === '/dashboard') {
            return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
        }

        return NextResponse.next();
    } catch (error) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: [
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
