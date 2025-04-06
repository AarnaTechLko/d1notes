import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.SECRET_KEY });
    const {pathname} = req.nextUrl
    
    const unprotectedPaths = [ //unauthenticated users have access to only these paths
        '/', // homepage
        '/login',
        '/register',
        '/coach/signup',
        '/enterprise/signup',
        '/howitworks',
    ];
    const unprotectedCompletedProfilePaths = [//authenticated users who have not completed their profile only have access to these routes
        '/', // homepage
        '/howitworks',
        '/completeprofile'
    ];
    const playerAccessOnlyPaths = [
        '/dashboard',
        '/joinrequests',
        '/yourteams',
        '/payment-history',
        '/messages',
        '/profile',
        '/changepassword',
        '/completeprofile'
    ];
    const coachAccessOnlyPaths = [
        '/coach/dashboard',
        '/coach/earnings',
        '/coach/charges',
        '/coach/joinrequests',
        '/coach/teams',
        '/coach/messages',
        '/coach/profile',
        '/coach/changepassword',
        '/coach/completeprofile'
    ];
    const enterpriseAccessOnlyPaths = [
        '/enterprise/dashboard',
        '/enterprise/teams',
        '/enterprise/coaches',
        '/enterprise/players',
        '/enterprise/joinrequests',
        '/enterprise/doc',
        '/enterprise/teamsarchived',
        '/enterprise/players/archived',
        '/enterprise/coaches/archived',
        '/enterprise/profile',
        '/enterprise/changepassword',
        '/enterprise/massuploadteams'
    ];
    
    const isEnterpriseOnlyAccess = enterpriseAccessOnlyPaths.includes(pathname) || pathname.startsWith('/enterprise/addcoaches') || pathname.startsWith('/enterprise/teams/edit') || pathname.startsWith('/enterprise/invitations')
    
    //Frontend rendering routes (make sure middleware does not intercept these)
    const isStaticAsset =
        pathname.startsWith('/_next/static') ||
        pathname.startsWith('/_next/image') ||
        pathname === '/favicon.ico';

    //for Loggin in
    const isApiRoute = pathname.startsWith('/api');
    const isUnprotectedPath = unprotectedPaths.includes(pathname) || isStaticAsset || isApiRoute;
    const isProtectedLoginPath = !isUnprotectedPath;

    //for Completing Profile
    const isUnprotectedCompletedProfilePath = unprotectedCompletedProfilePaths.includes(pathname) || isStaticAsset || isApiRoute;
    const isProtectedCompletedProfilePath = !isUnprotectedCompletedProfilePath;

    //if the user hasn't logged in and they are accessing a page that they aren't allowed, redirect them to login page
    if (!token && isProtectedLoginPath) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    //force users to complete their profile
    if (token && !token?.isCompletedProfile && isProtectedCompletedProfilePath && token?.type === 'player') {
        return NextResponse.redirect(new URL("/completeprofile", req.url));
    }
    else if (token && !token?.isCompletedProfile && isProtectedCompletedProfilePath && token?.type === 'coach') {
        return NextResponse.redirect(new URL("/coach/completeprofile", req.url));
    }

    //allow roles to only access their own pages
    if (token && token?.type === 'player' && (coachAccessOnlyPaths.includes(pathname) || isEnterpriseOnlyAccess)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    else if (token && token?.type === 'coach' && (playerAccessOnlyPaths.includes(pathname) || isEnterpriseOnlyAccess)) {
        return NextResponse.redirect(new URL("/coach/dashboard", req.url));
    }
    else if (token && token?.type === 'enterprise' && (coachAccessOnlyPaths.includes(pathname) || playerAccessOnlyPaths.includes(pathname))) {
        return NextResponse.redirect(new URL("/enterprise/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/:path*']
};
