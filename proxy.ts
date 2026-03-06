import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Define your route categories
const publicRoutes = ['/login', '/signup', '/'];
const authRoutes = ['/login', '/signup'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 2. Get the token from cookies (Industry standard for Poly-repo)
    // Assuming your backend sets an 'accessToken' or 'session' cookie
    const token = request.cookies.get('accessToken')?.value;

    const isAuthRoute = authRoutes.includes(pathname);
    const isPublicRoute = publicRoutes.includes(pathname);

    // 3. Logic: Redirect Unauthenticated users to Login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Logic: Redirect Authenticated users away from Login/Signup to Dashboard
    if (token && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// 5. Matcher: Prevent running on assets/static files for performance
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};