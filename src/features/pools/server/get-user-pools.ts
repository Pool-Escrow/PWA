import 'server-only'

import type { PoolItem } from '@/lib/entities/models/pool-item'
import { verifyToken } from '@/server/auth/privy'
import { getUserUpcomingPoolsUseCase } from '@/server/use-cases/pools/get-user-pools'
import type { Address } from 'viem'

export async function getUserPools(chainId?: number): Promise<{
    pools: PoolItem[]
    metadata: {
        totalUserPools: number
        upcomingUserPools: number
        visibleUserPools: number
        hasValidUser: boolean
    }
}> {
    try {
        const user = await verifyToken().catch(() => null)

        if (!user?.wallet?.address) {
            return {
                pools: [],
                metadata: {
                    totalUserPools: 0,
                    upcomingUserPools: 0,
                    visibleUserPools: 0,
                    hasValidUser: false,
                },
            }
        }

        const userAddress = user.wallet.address as Address
        const userPools = await getUserUpcomingPoolsUseCase(userAddress, chainId)

        const sortedPools = userPools
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 3)

        const metadata = {
            totalUserPools: userPools.length,
            upcomingUserPools: userPools.length,
            visibleUserPools: sortedPools.length,
            hasValidUser: true,
        }

        return {
            pools: sortedPools,
            metadata,
        }
    } catch (error) {
        console.error('[getUserPools] Unexpected error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
        })
        return {
            pools: [],
            metadata: {
                totalUserPools: 0,
                upcomingUserPools: 0,
                visibleUserPools: 0,
                hasValidUser: false,
            },
        }
    }
}
