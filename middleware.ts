import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.SECRET_KEY });
    console.log(req.nextUrl.pathname)

    const paths = ['/dashboard', '/browse', '/coach']
    const isProtectedPath = paths.some(path => req.nextUrl.pathname.startsWith(path));

    if (!token && isProtectedPath) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    
    if (token && !token?.isCompletedProfile && isProtectedPath) {
        return NextResponse.redirect(new URL("/completeprofile", req.url));
    }

    return NextResponse.next();
}

export const config = {
      matcher: ['/dashboard', '/browse/:path*', '/coach/:path*'], // Apply middleware only to these routes
};
