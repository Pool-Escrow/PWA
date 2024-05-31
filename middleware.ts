import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getWalletAddress, isAdmin } from './utils/privy'

export const config = {
	matcher: '/admin/:path*',
}

export async function middleware(request: NextRequest) {
	const privyAuthToken = request.cookies.get('privy-token')?.value
	if (!privyAuthToken) {
		return NextResponse.rewrite(new URL('/login', request.url))
	}

	const address = await getWalletAddress(privyAuthToken)

	if (!(await isAdmin(address))) {
		NextResponse.rewrite(new URL('/', request.url))
	}

	return NextResponse.next()
}
