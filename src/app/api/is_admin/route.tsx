import 'server-only'

import { getWalletAddress, isAdmin } from '@/lib/server/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    console.log('is_admin API Hit')

    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!privyAuthToken) {
        // TODO: redirect to login page instead
        return NextResponse.json({ isAdmin: false })
    }

    const address = await getWalletAddress(privyAuthToken)

    if (!(await isAdmin(address))) {
        return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({ isAdmin: true })
}
