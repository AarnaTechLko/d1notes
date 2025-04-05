import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.SECRET_KEY });
    const {pathname} = req.nextUrl
    // console.log(req.nextUrl.pathname)
    const unprotectedPaths = [
        '/', // homepage
        '/login',
        '/register',
        '/coach/signup',
        '/enterprise/signup',
        '/howitworks',
    ];

    const isStaticAsset =
        pathname.startsWith('/_next/static') ||
        pathname.startsWith('/_next/image') ||
        pathname === '/favicon.ico';

    const isApiRoute = pathname.startsWith('/api');
    const isProtectedLoginPath = !unprotectedPaths.includes(pathname) || isStaticAsset || isApiRoute;

    // const paths = ['/dashboard', '/browse', '/coach']
    // const isProtectedPath = paths.some(path => req.nextUrl.pathname.startsWith(path));

    if (!token && isProtectedLoginPath) {
    // if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    const unprotectedCompletedProfilePaths = [
        '/', // homepage
        '/howitworks',
        '/completeprofile'
    ];
    const isProtectedCompletedProfilePath = !unprotectedCompletedProfilePaths.includes(pathname) || isStaticAsset || isApiRoute;

    if (token && !token?.isCompletedProfile && isProtectedCompletedProfilePath) {
        console.log('HERE IN THE MIDDLEWARE: REDIRECTING TO COMPLETEPROFILE')
        console.log('TOKEN: ', token)
        return NextResponse.redirect(new URL("/completeprofile", req.url));
    }

    return NextResponse.next();
}

export const config = {
    //   matcher: ['/dashboard', '/browse/:path*', '/coach/:path*'], // Apply middleware only to these routes
    matcher: ['/:path*']
    // matcher: ['/((?!^$|api|_next/static|_next/image|favicon.ico|login|register|coach/signup|enterprise/signup|howitworks).*)'] // homepage not getting excluded for some reason
};
