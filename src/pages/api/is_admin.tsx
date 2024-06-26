import 'server-only'

import { getWalletAddress, isAdmin } from '@/lib/server/auth'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Parse the request body
    console.log('is_admin API Hit')

    const privyAuthToken = req.cookies?.['privy-token']
    // .get('privy-token')?.value
    if (!privyAuthToken) {
        // TODO: redirecto to login page instead
        return res.status(200).json({ isAdmin: false })
    }

    const address = await getWalletAddress(privyAuthToken)

    console.log('address', address)

    if (!(await isAdmin(address))) {
        return res.status(200).json({ isAdmin: false })
    }

    return res.status(200).json({ isAdmin: true })
}
