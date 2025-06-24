import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { 'pool-id': string } }) {
    try {
        const poolId = params['pool-id']
        const { searchParams } = request.nextUrl
        const chainIdParam = searchParams.get('chainId')
        const chainId = chainIdParam ? parseInt(chainIdParam, 10) : undefined

        if (!poolId) {
            return NextResponse.json({ message: 'poolId is required' }, { status: 400 })
        }

        if (chainIdParam && isNaN(chainId as number)) {
            return NextResponse.json({ message: 'Invalid chainId' }, { status: 400 })
        }

        const data = await getPoolDetailsById({ queryKey: ['pool-details', poolId], chainId })
        if (!data) {
            return NextResponse.json({ message: 'Pool not found' }, { status: 404 })
        }
        return NextResponse.json(data)
    } catch (error) {
        console.error('[API /pools/[pool-id]] Error:', error)
        return NextResponse.json(
            { message: `Failed to fetch pool details: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 },
        )
    }
}
