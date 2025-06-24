import { getUpcomingPools } from '@/features/pools/server/get-upcoming-pools'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const chainIdParam = searchParams.get('chainId')
        const chainId = chainIdParam ? parseInt(chainIdParam, 10) : undefined

        if (chainIdParam && isNaN(chainId as number)) {
            return NextResponse.json({ message: 'Invalid chainId' }, { status: 400 })
        }

        const data = await getUpcomingPools(chainId)
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API /pools/upcoming] Error:', error)
        return NextResponse.json(
            { message: `Failed to fetch upcoming pools: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 },
        )
    }
}
