// import { verifyToken } from '@/server/auth/privy'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if the route is /my-pools
    // if (request.nextUrl.pathname === '/my-pools') {
    //     try {
    //         const user = await verifyToken()

    //         // If no user is found, redirect to the main page
    //         if (!user) {
    //             return NextResponse.redirect(new URL('/', request.url))
    //         }
    //     } catch {
    //         // If there's an error verifying the token, redirect to the main page
    //         return NextResponse.redirect(new URL('/', request.url))
    // }
    // }

    const response = NextResponse.next()

    console.info('\x1b[35m[middleware]\x1b[0m', '🦩\t', '\x1b[36m' + request.nextUrl.pathname + '\x1b[0m')

    // response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    // response.headers.set('X-XSS-Protection', '1; mode=block')

    return response
}

export const config = {
    // matcher: '/disabled',
    matcher: ['/((?!api|_next|static|public|favicon.ico|app/assets).*)', '/my-pools'],
}
