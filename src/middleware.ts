import { verifyToken } from '@/app/_server/auth/privy'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Conditional Logging for debugging (remove ANSI codes in production)
    if (process.env.NODE_ENV !== 'production') {
        console.info('\x1b[35m[middleware]\x1b[0m', '🦩\t', '\x1b[36m' + request.nextUrl.pathname + '\x1b[0m')
    } else {
        // Simplified logging for production (optional, remove if no logging needed)
        // console.info('[middleware]', '🦩\t', request.nextUrl.pathname)
    }

    // Security headers
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-XSS-Protection', '1; mode=block')

    // Protected routes that require authentication
    const PROTECTED_ROUTES = ['/profile', '/dashboard', '/my-pools']
    const isProtectedRoute = PROTECTED_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute) {
        try {
            const user = await verifyToken()

            // If no user is found, redirect to the main page
            if (!user) {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (error) {
            console.error(error)
            // If there's an error verifying the token, redirect to the main page
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - API routes
         * - Next.js internals
         * - Public files
         * - Privy endpoints
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*|privy).*)',
    ],
}
