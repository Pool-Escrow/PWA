import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { env } from '@/env.mjs'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { isPoolStatusVisible } from '@/lib/utils/pool-status-mapping'
import { transformContractPoolToUIPool, transformDbPoolToUIPool } from '@/lib/utils/pool-transforms'
import { getContractPools } from '@/server/persistence/pools/blockchain/get-contract-pools'
import { useDeveloperStore } from '@/stores/developer.store'
import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import type { PoolFilterMode } from '../stores/developer.store'

// Only log errors and critical issues
const logger = {
    log: (...args: unknown[]) => {
        // Only log in development and only critical information
        if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
            console.log('[useUpcomingPools]', ...args)
        }
    },
    warn: (...args: unknown[]) => console.warn('[useUpcomingPools]', ...args),
    error: (...args: unknown[]) => console.error('[useUpcomingPools]', ...args),
}

// Module-level flag to prevent repeated warnings
let poolsSyncWarningLogged = false

const fetchUpcomingPools = async (chainId: number, mode: PoolFilterMode): Promise<PoolItem[]> => {
    const startTime = performance.now()

    try {
        const supabase = getSupabaseBrowserClient()

        // Fetch contract pools with error handling
        let contractPools: Awaited<ReturnType<typeof getContractPools>> = []

        try {
            contractPools = await getContractPools(chainId)
            logger.log(`✅ Contract pools fetched: ${contractPools.length} pools`)
        } catch (contractError) {
            // Only show user-facing error if it's not a known RPC issue
            const errorMessage = contractError instanceof Error ? contractError.message : String(contractError)
            if (
                !errorMessage.includes('403') &&
                !errorMessage.includes('429') &&
                !errorMessage.includes('sepolia.base.org')
            ) {
                logger.error('Unexpected contract fetch error:', contractError)
            }
            // Continue with empty contract pools if RPC fails
            contractPools = []
        }

        // Fetch database pools
        const { data: dbPools, error: dbError } = await supabase.from('pools').select('*')

        if (dbError) {
            logger.error('❌ Database error:', dbError)
            throw new Error(`Database error: ${dbError.message}`)
        }

        logger.log(`✅ Database pools fetched: ${dbPools?.length || 0} pools`)

        // Log pools that exist in contract but not in DB (only once per session)
        if (!poolsSyncWarningLogged) {
            const poolsNotInDb = contractPools.filter(
                contractPool => !dbPools?.some(dp => dp.contract_id === parseInt(contractPool.id)),
            )
            if (poolsNotInDb.length > 0) {
                logger.warn('⚠️ Pools in contract but not in DB:', {
                    count: poolsNotInDb.length,
                })
                poolsSyncWarningLogged = true
            }
        }

        // Filter eligible contract pools
        const eligibleContractPools = contractPools.filter(pool => {
            return (pool.status as POOLSTATUS) <= POOLSTATUS.DEPOSIT_ENABLED
        })

        // Only display pools that have a corresponding DB record and whose DB status is visible
        const visibilityFilteredPools = eligibleContractPools.filter(contractPool => {
            const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
            if (!dbPool) return false
            return isPoolStatusVisible(dbPool.status)
        })

        // Transform pools to UI format
        let transformedPools: PoolItem[] = []

        if (mode === 'intersection') {
            transformedPools = visibilityFilteredPools.map(contractPool => {
                const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))

                // If no DB pool found in development, create minimal data
                if (!dbPool && env.NODE_ENV === 'development') {
                    return transformContractPoolToUIPool(contractPool, {
                        bannerImage: undefined,
                        softCap: undefined,
                    })
                }

                return transformContractPoolToUIPool(contractPool, dbPool)
            })
        } else if (mode === 'contract') {
            transformedPools = eligibleContractPools.map(contractPool => {
                const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
                return transformContractPoolToUIPool(contractPool, dbPool)
            })
        } else if (mode === 'database') {
            const visibleDbPools = dbPools?.filter(pool => isPoolStatusVisible(pool.status)) ?? []
            transformedPools = visibleDbPools.map(transformDbPoolToUIPool)
        }

        // Sort pools
        const sortedPools = transformedPools.sort((a, b) => {
            // First, sort by status (descending)
            const statusDiff = Number(b.status) - Number(a.status)
            if (statusDiff !== 0) return statusDiff

            // If status is the same, sort by startDate (descending)
            const dateA = new Date(a.startDate || a.endDate).getTime()
            const dateB = new Date(b.startDate || b.endDate).getTime()
            return dateB - dateA
        })

        const totalTime = performance.now() - startTime

        // Only log final summary if pools found or if there's an issue
        if (sortedPools.length === 0) {
            logger.warn(`⚠️ No pools returned after processing (${totalTime.toFixed(0)}ms)`)
        } else {
            logger.log(`🎉 Found ${sortedPools.length} pools (${totalTime.toFixed(0)}ms)`)
        }

        return sortedPools
    } catch (error) {
        logger.error('❌ Unhandled error in fetchUpcomingPools:', error)
        throw error
    }
}

// -------------------------------------------------------------------------------------
// Hook Definition
// -------------------------------------------------------------------------------------
export const useUpcomingPools = () => {
    const chainId = useChainId()
    const { poolFilterMode, setPoolFilterMode } = useDeveloperStore(state => ({
        poolFilterMode: state.settings.poolFilterMode,
        setPoolFilterMode: state.setPoolFilterMode,
    }))

    const queryInfo = useQuery<PoolItem[]>({
        queryKey: ['upcoming-pools', chainId, poolFilterMode],
        queryFn: () => fetchUpcomingPools(chainId, poolFilterMode),
        enabled: !!chainId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: false, // Retries are now handled server-side
    })

    // Debug: Add hook call logging only when verbose
    if (env.NODE_ENV === 'development' && env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        const { data, isError, error } = queryInfo
        logger.log('🔗 Hook called with chainId:', chainId, 'mode:', poolFilterMode)
        if (data) {
            logger.log('🎉 Query success:', { poolCount: data.length, pools: data.slice(0, 3) })
        }
        if (isError) {
            logger.error('❌ Query error:', error)
        }
    }

    const retryFetch = () => {
        logger.log('🔄 Manually refetching pools...')
        void queryInfo.refetch()
    }

    return {
        ...queryInfo,
        setPoolFilterMode,
        retryFetch,
    }
}
