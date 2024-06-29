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

    // Get hostname of request (e.g. app.poolparty.cc, app.localhost:3000)
    let hostname = req.headers.get('host')!.replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)

    // special case for Vercel preview deployment URLs
    if (hostname.includes('---') && hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)) {
        hostname = `${hostname.split('---')[0]}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
    }

    const searchParams = req.nextUrl.searchParams.toString()
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`

    console.log('Hostname:', hostname, pathname)
    console.log('Search params:', searchParams)
    console.log('Path:', path)

    // rewrites for app pages
    if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
        // const session = await getToken({ req });
        // if (!session && path !== "/login") {
        //   return NextResponse.redirect(new URL("/login", req.url));
        //   } else
        //   if (session && path == "/login") {
        //   return NextResponse.redirect(new URL("/", req.url));
        // }
        return NextResponse.rewrite(new URL(`/pwa${path === '/' ? '' : path}`, req.url))
    }

    // rewrite root application to `/home` folder
    if (hostname === 'localhost:3000' || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
        return NextResponse.rewrite(new URL(`/landing${path === '/' ? '' : path}`, req.url))
    }

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
