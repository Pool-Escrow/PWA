// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getWalletAddress, isAdmin } from './lib/server/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    console.log('Middleware called with pathname:', pathname)

    // Skip middleware for static assets, API routes, and other excluded paths
    if (
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/images/') ||
        pathname === '/favicon.ico' ||
        pathname === '/manifest.json'
    ) {
        return NextResponse.next()
    }

    // Open routes
    if (pathname === '/pools' || (pathname.startsWith('/pool/') && pathname !== '/pool/new')) {
        console.log('Open route detected')
        return NextResponse.next()
    }

    // Verify auth token
    const privyAuthToken = request.cookies.get('privy-token')?.value
    console.log('Auth token:', privyAuthToken)

    if (!privyAuthToken) {
        console.log('No auth token, redirecting to /pools')
        return NextResponse.redirect(new URL('/pools', request.url))
    }

    const address = await getWalletAddress(privyAuthToken)
    console.log('Address:', address)

    // Verify user profile
    if (pathname.startsWith('/profile/')) {
        const profileAddress = pathname.split('/')[2]
        if (address?.toLowerCase() !== profileAddress.toLowerCase()) {
            console.log('Profile mismatch, redirecting to /pools')
            return NextResponse.redirect(new URL('/pools', request.url))
        }
    }

    // Verify admin for creating pool
    if (pathname === '/pool/new') {
        console.log('Checking admin for /pool/new')
        const isAdminResult = await isAdmin(address)
        console.log('Is admin:', isAdminResult)

        if (!isAdminResult) {
            console.log('Not admin, redirecting to /pools')
            return NextResponse.redirect(new URL('/pools', request.url))
        }
    }

    // For all other routes, allow access if authenticated
    console.log('Allowing access to authenticated route')
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },

        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            has: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },

        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            has: [{ type: 'header', key: 'x-present' }],
            missing: [{ type: 'header', key: 'x-missing', value: 'prefetch' }],
        },
    ],
}
