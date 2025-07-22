import type { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { fetchAllPools, formatSubgraphAmount, subgraphTimestampToDate } from '@/lib/subgraph/client'

interface SubgraphPoolsQueryResult {
    pools: PoolItem[]
    metadata: {
        totalContractPools: number
        totalDbPools: number
        visiblePools: number
        syncedPools: number
        fetchTime: number
        cacheStatus: 'hit' | 'miss'
    }
}

/**
 * Get upcoming pools using subgraph instead of onchain calls
 * This dramatically reduces the number of RPC requests and improves performance
 */
export const getUpcomingPoolsFromSubgraph = async (): Promise<SubgraphPoolsQueryResult> => {
    const startTime = Date.now()

    try {
        console.log('[getUpcomingPoolsFromSubgraph] Fetching pools from subgraph...')

        // Fetch all pools from subgraph (much faster than onchain calls)
        const response = await fetchAllPools({
            first: 1000, // Get up to 1000 pools
            orderBy: 'timestamp_',
            orderDirection: 'desc',
        })

        console.log(`[getUpcomingPoolsFromSubgraph] ✅ Fetched ${response.poolCreateds.length} pools from subgraph`)

        // Convert subgraph data to PoolItem format
        const pools: PoolItem[] = response.poolCreateds.map(subgraphPool => {
            // Calculate estimated dates (these would ideally come from PoolStartTimeChanged/PoolEndTimeChanged events)
            const createdAt = subgraphTimestampToDate(subgraphPool.timestamp_)
            const estimatedStartDate = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000) // +24 hours
            const estimatedEndDate = new Date(estimatedStartDate.getTime() + 2 * 60 * 60 * 1000) // +2 hours duration

            return {
                id: subgraphPool.poolId,
                name: subgraphPool.poolName,
                startDate: estimatedStartDate,
                endDate: estimatedEndDate,
                numParticipants: 0, // This would need to be calculated from deposits - for now defaulting to 0
                status: 1 as POOLSTATUS, // Assuming DEPOSIT_ENABLED for upcoming pools
                image: '', // Not available in subgraph - would need to be stored in database
                softCap: Math.ceil(formatSubgraphAmount(subgraphPool.depositAmountPerPerson) * 10), // Assuming 10 participants as soft cap
            }
        })

        // Filter for upcoming pools (in the future, this could be done in the GraphQL query)
        const now = new Date()
        const upcomingPools = pools.filter(pool => pool.startDate > now)

        const fetchTime = Date.now() - startTime

        console.log(
            `[getUpcomingPoolsFromSubgraph] ✅ Processed ${upcomingPools.length} upcoming pools in ${fetchTime}ms`,
        )

        return {
            pools: upcomingPools,
            metadata: {
                totalContractPools: pools.length,
                totalDbPools: pools.length,
                visiblePools: upcomingPools.length,
                syncedPools: pools.length,
                fetchTime,
                cacheStatus: 'hit', // Using 'hit' since we got data from subgraph
            },
        }
    } catch (error) {
        console.error('[getUpcomingPoolsFromSubgraph] ❌ Error fetching from subgraph:', error)

        // Return empty result instead of throwing
        return {
            pools: [],
            metadata: {
                totalContractPools: 0,
                totalDbPools: 0,
                visiblePools: 0,
                syncedPools: 0,
                fetchTime: Date.now() - startTime,
                cacheStatus: 'miss',
            },
        }
    }
}
