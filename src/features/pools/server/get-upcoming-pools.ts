import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { createSupabaseServerClient } from '@/lib/supabase'
import { isPoolStatusVisible } from '@/lib/utils/pool-status-mapping'
import { transformContractPoolToUIPool } from '@/lib/utils/pool-transforms'
import type { ContractPool } from '@/server/persistence/pools/blockchain/get-contract-pools'
import { getContractPools } from '@/server/persistence/pools/blockchain/get-contract-pools'
import type { Database } from '@/types/db'

type DbPool = Database['public']['Tables']['pools']['Row']

/**
 * Get upcoming pools with improved error handling and data consistency
 * This function combines blockchain and database data, intended for server-side use.
 */
export const getUpcomingPools = async (
    chainId?: number,
): Promise<{
    pools: PoolItem[]
    metadata: {
        totalContractPools: number
        totalDbPools: number
        visiblePools: number
        syncedPools: number
    }
}> => {
    try {
        // Fetch data in parallel for better performance
        const [contractPools, dbPoolsResult] = await Promise.all([
            getContractPools(chainId).catch((error: Error) => {
                console.warn('[getUpcomingPools] Contract fetch failed:', error.message)
                return [] as ContractPool[] // Graceful fallback
            }),
            createSupabaseServerClient()
                .from('pools')
                .select('*')
                .then((result: { data: DbPool[] | null; error: Error | null }) => {
                    if (result.error) {
                        console.error('[getUpcomingPools] Database fetch failed:', result.error)
                        return { data: [] as DbPool[], error: result.error }
                    }
                    return result
                }),
        ])

        const dbPools = dbPoolsResult.data || []

        // Create metadata for debugging and monitoring
        const metadata = {
            totalContractPools: contractPools.length,
            totalDbPools: dbPools.length,
            visiblePools: 0,
            syncedPools: 0,
        }

        const eligibleContractPools = contractPools.filter((pool: ContractPool) => {
            const isEligible = (pool.status as POOLSTATUS) <= POOLSTATUS.DEPOSIT_ENABLED
            return isEligible
        })

        // if (process.env.NODE_ENV === 'development') {
        //     console.log('[getUpcomingPools] 📊 Filtering Results:', {
        //         totalContractPools: contractPools.length,
        //         eligibleContractPools: eligibleContractPools.length,
        //         filteredOut: contractPools.length - eligibleContractPools.length,
        //     })
        // }

        // Find pools that exist in both contract and database with visible status
        const syncedhPools = eligibleContractPools
            .map((contractPool: ContractPool) => {
                const dbPool = dbPools.find((dp: DbPool) => dp.contract_id === parseInt(contractPool.id))

                if (!dbPool || !isPoolStatusVisible(dbPool.status)) {
                    return null
                }

                return transformContractPoolToUIPool(contractPool, {
                    bannerImage: dbPool.bannerImage,
                    softCap: dbPool.softCap,
                })
            })
            .filter((pool: PoolItem | null): pool is PoolItem => pool !== null)

        // Sort pools by status (descending) and then by start date (descending)
        const sortedPools = syncedhPools.sort((a: PoolItem, b: PoolItem) => {
            const statusDiff = Number(b.status) - Number(a.status)
            if (statusDiff !== 0) return statusDiff

            const dateA = new Date(a.startDate || a.endDate).getTime()
            const dateB = new Date(b.startDate || b.endDate).getTime()
            return dateB - dateA
        })

        // Update metadata
        metadata.visiblePools = syncedhPools.length
        metadata.syncedPools = eligibleContractPools.filter((cp: ContractPool) =>
            dbPools.some((dp: DbPool) => dp.contract_id === parseInt(cp.id)),
        ).length

        return {
            pools: sortedPools,
            metadata,
        }
    } catch (error) {
        console.error('[getUpcomingPools] Unexpected error:', error)
        throw new Error(`Failed to fetch upcoming pools: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}
