import type { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { fetchUserPools, formatSubgraphAmount, subgraphTimestampToDate } from '@/lib/subgraph/client'

/**
 * Get user pools using subgraph instead of onchain calls
 * This replaces the expensive getUserPools blockchain calls
 */
export const getUserPoolsFromSubgraph = async (
    userAddress: string,
    status: 'upcoming' | 'past' = 'upcoming',
): Promise<PoolItem[]> => {
    try {
        console.log(`[getUserPoolsFromSubgraph] Fetching ${status} pools for user: ${userAddress}`)

        // Fetch user's pools from subgraph
        const response = await fetchUserPools(userAddress)

        console.log(
            `[getUserPoolsFromSubgraph] ✅ Found ${response.poolCreateds.length} hosted pools and ${response.deposits.length} deposits`,
        )

        // Convert hosted pools to PoolItem format
        const hostedPools: PoolItem[] = response.poolCreateds.map(subgraphPool => {
            const createdAt = subgraphTimestampToDate(subgraphPool.timestamp_)
            const estimatedStartDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000)
            const estimatedEndDate = new Date(estimatedStartDate.getTime() + 2 * 60 * 60 * 1000)

            return {
                id: subgraphPool.poolId,
                name: subgraphPool.poolName,
                startDate: estimatedStartDate,
                endDate: estimatedEndDate,
                numParticipants: 0,
                status: 1 as POOLSTATUS, // DEPOSIT_ENABLED
                image: '',
                softCap: Math.ceil(formatSubgraphAmount(subgraphPool.depositAmountPerPerson) * 10),
            }
        })

        // Get unique pool IDs where user deposited (but didn't host)
        const depositedPoolIds = new Set(
            response.deposits
                .map(d => d.poolId)
                .filter(poolId => !response.poolCreateds.some(p => p.poolId === poolId)),
        )

        // For now, we'll just return hosted pools since getting full pool data for deposited pools
        // would require additional subgraph queries for each pool
        // In a production implementation, you'd want to batch fetch this data
        let allUserPools = hostedPools

        // TODO: Fetch full pool data for deposited pools
        // This could be done with a batch query to the subgraph
        console.log(
            `[getUserPoolsFromSubgraph] Note: ${depositedPoolIds.size} deposited pools not included (would need batch fetch)`,
        )

        // Filter by status
        const now = new Date()
        if (status === 'upcoming') {
            allUserPools = allUserPools.filter(pool => pool.startDate > now)
        } else {
            allUserPools = allUserPools.filter(pool => pool.endDate < now)
        }

        console.log(`[getUserPoolsFromSubgraph] ✅ Returning ${allUserPools.length} ${status} pools`)

        return allUserPools
    } catch (error) {
        console.error('[getUserPoolsFromSubgraph] ❌ Error fetching user pools from subgraph:', error)
        return []
    }
}
