import { getUserPools } from '@/features/pools/server/get-user-pools'
import { verifyToken } from '@/server/auth/privy'
import { type NextRequest, NextResponse } from 'next/server'
import type { Address } from 'viem'

export const dynamic = 'force-dynamic'

/**
 * API route to fetch user pools (upcoming or past).
 * Requires authentication.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 *
 * @example
 * // Fetches upcoming pools for the user on a specific chain
 * fetch('/api/pools/user-pools?status=upcoming&chainId=8453')
 *
 * @example
 * // Fetches past pools for the user on the default chain
 * fetch('/api/pools/user-pools?status=past')
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const user = await verifyToken()
        if (!user?.wallet?.address) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
        }
        const userAddress = user.wallet.address as Address

        const { searchParams } = request.nextUrl
        const status = searchParams.get('status') as 'upcoming' | 'past' | null
        const chainIdParam = searchParams.get('chainId')
        const chainId = chainIdParam ? parseInt(chainIdParam, 10) : undefined

        if (!status || !['upcoming', 'past'].includes(status)) {
            return NextResponse.json({ message: 'A valid status (upcoming or past) is required' }, { status: 400 })
        }

        if (chainIdParam && isNaN(chainId as number)) {
            return NextResponse.json({ message: 'Invalid chainId' }, { status: 400 })
        }

        const data = await getUserPools(userAddress, status, chainId)

        return NextResponse.json(data)
    } catch (error) {
        console.error('[API /pools/user-pools] Error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        return NextResponse.json({ message: `Failed to fetch user pools: ${errorMessage}` }, { status: 500 })
    }
}
