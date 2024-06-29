// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api/|_next/|_static/|_vercel|images/[\\w-]+\\.\\w+|manifest.json).*)',
    ],
}

export async function middleware(req: NextRequest) {
    const url = req.nextUrl
    const pathname = url.pathname
    let hostname = req.headers.get('host')!

    // Handle localhost:3000 and app.poolparty.cc
    const isDevelopment = process.env.NODE_ENV === 'development'
    const rootDomain = isDevelopment ? 'localhost:3000' : process.env.NEXT_PUBLIC_ROOT_DOMAIN

    // handle subdomains
    if (hostname.startsWith('app.')) {
        // for app.poolparty.cc or app.localhost:3000
        return NextResponse.rewrite(new URL(`/pwa${pathname}`, req.url))
    } else if (hostname === rootDomain || hostname.startsWith('www.')) {
        // for localhost:3000, poolparty.cc or www.poolparty.cc
        return NextResponse.rewrite(new URL(`/landing${pathname}`, req.url))
    }

    // if there is no condition match, continue with the regular request
    return NextResponse.next()

    // const subdomain = hostname.split('.')[0]

    // console.log('Subdomain:', subdomain)

    // // Skip middleware for static assets, API routes, and other excluded paths
    // if (
    //     pathname.startsWith('/_next/') ||
    //     pathname.startsWith('/api/') ||
    //     pathname.startsWith('/images/') ||
    //     pathname === '/favicon.ico' ||
    //     pathname === '/manifest.json' ||
    //     pathname === '/sw.js'
    // ) {
    //     return NextResponse.next()
    // }

    // // Open routes
    // if (pathname === '/pools' || (pathname.startsWith('/pool/') && pathname !== '/pool/new')) {
    //     console.log('Open route detected')
    //     return NextResponse.next()
    // }

    // // Verify auth token
    // const privyAuthToken = request.cookies.get('privy-token')?.value

    // if (!privyAuthToken) {
    //     console.log('No auth token, redirecting to /pools')
    //     return NextResponse.redirect(new URL('/pools', request.url))
    // }

    // const address = await getWalletAddress(privyAuthToken)
    // console.log('Address:', address)

    // // Verify user profile
    // if (pathname.startsWith('/profile/')) {
    //     const profileAddress = pathname.split('/')[2]
    //     if (address?.toLowerCase() !== profileAddress.toLowerCase()) {
    //         console.log('Profile mismatch, redirecting to /pools')
    //         return NextResponse.redirect(new URL('/pools', request.url))
    //     }
    // }

    // // Verify admin for creating pool
    // if (pathname === '/pool/new') {
    //     console.log('Checking admin for /pool/new')
    //     const isAdminResult = await isAdmin(address)
    //     console.log('Is admin:', isAdminResult)

    //     if (!isAdminResult) {
    //         console.log('Not admin, redirecting to /pools')
    //         return NextResponse.redirect(new URL('/pools', request.url))
    //     }
    // }

    // // For all other routes, allow access if authenticated
    // console.log('Allowing access to authenticated route')
    // return NextResponse.next()
}
