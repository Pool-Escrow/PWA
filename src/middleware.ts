import { verifyAuthInEdge } from '@/app/_server/auth/edge-auth'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Conditional Logging for debugging
    if (process.env.NODE_ENV !== 'production') {
        console.info('[middleware]', '🦩', request.nextUrl.pathname)
    }

    // Security headers
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=self')
    response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none')

    // Cache control for static assets
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/_next/static') || pathname.match(/\.(svg|jpg|png|css)$/)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }

    // Protected routes that require authentication
    const PROTECTED_ROUTES = ['/profile', '/dashboard', '/my-pools']
    const isProtectedRoute = PROTECTED_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute) {
        const payload = await verifyAuthInEdge()

        if (!payload) {
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
