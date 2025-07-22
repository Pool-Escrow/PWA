import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { createSupabaseServerClient } from '@/lib/supabase'
import { isPoolStatusVisible } from '@/lib/utils/pool-status-mapping'
import { transformContractPoolToUIPool } from '@/lib/utils/pool-transforms'
import type { ContractPool } from '@/server/persistence/pools/blockchain/get-contract-pools'
import { getContractPools } from '@/server/persistence/pools/blockchain/get-contract-pools'
import type { Database } from '@/types/db'
import { unstable_cache } from 'next/cache'

type DbPool = Database['public']['Tables']['pools']['Row']
type OptimizedDbPool = Pick<DbPool, 'contract_id' | 'bannerImage' | 'softCap' | 'status'>

interface PoolsQueryResult {
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
 * Optimized data fetcher with caching and scoped queries
 * Cache for 30 seconds with stale-while-revalidate pattern
 */
const getCachedDbPools = unstable_cache(
    async (): Promise<OptimizedDbPool[]> => {
        const startTime = Date.now()

        const supabase = createSupabaseServerClient()
        const { data: dbPools, error } = await supabase
            .from('pools')
            .select('contract_id, bannerImage, softCap, status') // Only fetch needed fields
            .not('contract_id', 'is', null) // Only pools with contract IDs

        if (error) {
            console.error('[getCachedDbPools] Database fetch failed:', error)
            throw new Error(`Database query failed: ${error.message}`)
        }

        const fetchTime = Date.now() - startTime
        if (process.env.NODE_ENV === 'development') {
            console.log(`[getCachedDbPools] ⚡ Fetched ${dbPools?.length || 0} pools in ${fetchTime}ms`)
        }

        return dbPools || []
    },
    ['db-pools-cache'],
    {
        revalidate: 30, // 30 seconds cache
        tags: ['pools', 'db-pools'],
    },
)

/**
 * Get upcoming pools with improved error handling, caching and data consistency
 * Optimized for performance with scoped queries and proper error boundaries
 */
export const getUpcomingPools = async (chainId?: number): Promise<PoolsQueryResult> => {
    const startTime = Date.now()

    try {
        // Parallel fetch with optimized error handling
        const [contractPools, dbPools] = await Promise.all([
            getContractPools(chainId).catch((error: Error) => {
                console.warn('[getUpcomingPools] Contract fetch failed, using fallback:', error.message)
                return [] as ContractPool[] // Graceful fallback
            }),
            getCachedDbPools().catch((error: Error) => {
                console.error('[getUpcomingPools] Database fetch failed:', error.message)
                return [] as DbPool[] // Graceful fallback
            }),
        ])

        // Early validation - if both sources fail, return empty result
        if (contractPools.length === 0 && dbPools.length === 0) {
            console.warn('[getUpcomingPools] ⚠️ Both data sources returned empty results')
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

        // 1. Filter contract pools by eligibility (status-based)
        const eligibleContractPools = contractPools.filter((pool: ContractPool) => {
            return (pool.status as POOLSTATUS) <= POOLSTATUS.DEPOSIT_ENABLED
        })

        // 2. Create lookup map for O(1) database pool access
        const dbPoolMap = new Map(dbPools.map((pool: OptimizedDbPool) => [pool.contract_id, pool]))

        // 3. Transform eligible pools with database enrichment
        const syncedPools = eligibleContractPools
            .map((contractPool: ContractPool) => {
                const dbPool = dbPoolMap.get(parseInt(contractPool.id))

                // Skip if no database entry or not visible
                if (!dbPool || !isPoolStatusVisible(dbPool.status)) {
                    return null
                }

                return transformContractPoolToUIPool(contractPool, {
                    bannerImage: dbPool.bannerImage,
                    softCap: dbPool.softCap,
                })
            })
            .filter((pool: PoolItem | null): pool is PoolItem => pool !== null)

        // 4. Optimized sorting with status priority
        const sortedPools = syncedPools.sort((a: PoolItem, b: PoolItem) => {
            // Primary: Status (descending - higher status first)
            const statusDiff = Number(b.status) - Number(a.status)
            if (statusDiff !== 0) return statusDiff

            // Secondary: Start date (descending - newer first)
            const dateA = new Date(a.startDate || a.endDate).getTime()
            const dateB = new Date(b.startDate || b.endDate).getTime()
            return dateB - dateA
        })

        const fetchTime = Date.now() - startTime

        // Generate comprehensive metadata
        const metadata = {
            totalContractPools: contractPools.length,
            totalDbPools: dbPools.length,
            visiblePools: syncedPools.length,
            syncedPools: eligibleContractPools.filter((cp: ContractPool) => dbPoolMap.has(parseInt(cp.id))).length,
            fetchTime,
            cacheStatus: 'miss' as const, // Cache status would be determined by the caller
        }

        // Development logging with performance metrics
        if (process.env.NODE_ENV === 'development') {
            console.log('[getUpcomingPools] 🎯 Results:', {
                ...metadata,
                efficiency:
                    metadata.totalContractPools > 0
                        ? Math.round((metadata.visiblePools / metadata.totalContractPools) * 100)
                        : 0,
            })
        }

        return {
            pools: sortedPools,
            metadata,
        }
    } catch (error) {
        const fetchTime = Date.now() - startTime
        console.error('[getUpcomingPools] Critical error:', error)

        // Return safe fallback with error metadata
        return {
            pools: [],
            metadata: {
                totalContractPools: 0,
                totalDbPools: 0,
                visiblePools: 0,
                syncedPools: 0,
                fetchTime,
                cacheStatus: 'miss',
            },
        }
    }
}
