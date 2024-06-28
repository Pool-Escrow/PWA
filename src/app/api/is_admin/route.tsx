import 'server-only'

import { getWalletAddress, isAdmin } from '@/lib/server/auth'
import type { NextApiRequest } from 'next'
import { NextResponse } from 'next/server'

export async function POST(req: NextApiRequest) {
    // Parse the request body
    console.log('is_admin API Hit')

    const privyAuthToken = req.cookies?.['privy-token']
    // .get('privy-token')?.value
    if (!privyAuthToken) {
        // TODO: redirecto to login page instead
        return NextResponse.json({ isAdmin: false })
    }

    const address = await getWalletAddress(privyAuthToken)

    // console.log('address', address)

    if (!(await isAdmin(address))) {
        return NextResponse.json({ isAdmin: false })
    }

    return NextResponse.json({ isAdmin: true })
}
