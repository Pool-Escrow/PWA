import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getWalletAddress, isAdmin } from './lib/server/auth'

export const config = {
    // matcher: '/profile/:path*',
    matcher: '/developer/:path*',
}

export async function middleware(request: NextRequest) {
    console.log('middleware')
    const privyAuthToken = request.cookies.get('privy-token')?.value
    if (!privyAuthToken) {
        // TODO: redirecto to login page instead
        return NextResponse.rewrite(new URL('/', request.url))
    }

    const address = await getWalletAddress(privyAuthToken)

    console.log('address', address)

    if (!(await isAdmin(address))) {
        console.log('not admin')
        // NextResponse.rewrite(new URL('/', request.url))
    }

    return NextResponse.next()
}
