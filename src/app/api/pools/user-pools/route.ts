import { getUserPools } from '@/features/pools/server/get-user-pools'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const chainIdParam = searchParams.get('chainId')

        if (!chainIdParam) {
            return NextResponse.json({ message: 'chainId is required' }, { status: 400 })
        }

        const chainId = parseInt(chainIdParam, 10)
        if (isNaN(chainId)) {
            return NextResponse.json({ message: 'Invalid chainId' }, { status: 400 })
        }

        const data = await getUserPools(chainId)
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API /pools/user-pools] Error:', error)
        return NextResponse.json(
            { message: `Failed to fetch user pools: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 },
        )
    }
}
