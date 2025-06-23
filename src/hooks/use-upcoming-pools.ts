import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { env } from '@/env.mjs'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { isPoolStatusVisible, logStatusMapping, mapDbStatusToContractStatus } from '@/lib/utils/pool-status-mapping'
import { transformContractPoolToUIPool, transformDbPoolToUIPool } from '@/lib/utils/pool-transforms'
import { getContractPools } from '@/server/persistence/pools/blockchain/get-contract-pools'
import { useDeveloperStore } from '@/stores/developer.store'
import { useQuery } from '@tanstack/react-query'
import { useChainId } from 'wagmi'
import type { PoolFilterMode } from '../stores/developer.store'

const isVerbose = env.NEXT_PUBLIC_VERBOSE_LOGS === 'true'
const logger = {
    log: (...args: unknown[]) => isVerbose && console.log('[useUpcomingPools]', ...args),
    warn: (...args: unknown[]) => isVerbose && console.warn('[useUpcomingPools]', ...args),
    error: (...args: unknown[]) => console.error('[useUpcomingPools]', ...args), // Always log errors
}

const fetchUpcomingPools = async (chainId: number, mode: PoolFilterMode): Promise<PoolItem[]> => {
    const startTime = performance.now()
    logger.log('🔄 Starting fetch process...')

    try {
        const supabase = getSupabaseBrowserClient()
        logger.log('✅ Supabase client initialized')

        // Fetch contract pools with detailed logging and retry logic
        logger.log('📡 Fetching contract pools...')
        const contractPoolsStart = performance.now()

        let contractPools: Awaited<ReturnType<typeof getContractPools>> = []
        let contractPoolsTime = 0

        try {
            contractPools = await getContractPools(chainId)
            contractPoolsTime = performance.now() - contractPoolsStart
            logger.log(`✅ Contract pools fetched: ${contractPools.length} pools in ${contractPoolsTime.toFixed(2)}ms`)
        } catch (contractError) {
            contractPoolsTime = performance.now() - contractPoolsStart
            logger.warn(`⚠️ Contract pools fetch failed in ${contractPoolsTime.toFixed(2)}ms:`, contractError)

            // Continue with empty contract pools if RPC fails
            contractPools = []

            // Only show user-facing error if it's not a known RPC issue
            const errorMessage = contractError instanceof Error ? contractError.message : String(contractError)
            if (
                !errorMessage.includes('403') &&
                !errorMessage.includes('429') &&
                !errorMessage.includes('sepolia.base.org')
            ) {
                logger.error('Unexpected contract fetch error:', contractError)
            }
        }

        // Fetch database pools with detailed logging
        logger.log('🗄️ Fetching database pools...')
        const dbPoolsStart = performance.now()
        const { data: dbPools, error: dbError } = await supabase.from('pools').select('*')
        const dbPoolsTime = performance.now() - dbPoolsStart

        if (dbError) {
            logger.error('❌ Database error:', dbError)
            throw new Error(`Database error: ${dbError.message}`)
        }

        logger.log(`✅ Database pools fetched: ${dbPools?.length || 0} pools in ${dbPoolsTime.toFixed(2)}ms`)

        // Environment and development mode logging
        const isDevelopment = env.NODE_ENV === 'development'
        const network = env.NEXT_PUBLIC_NETWORK

        logger.log('🔧 Environment configuration:', {
            isDevelopment,
            network,
            nodeEnv: env.NODE_ENV,
            contractPoolsCount: contractPools.length,
            dbPoolsCount: dbPools?.length || 0,
        })

        if (isDevelopment && isVerbose) {
            logger.log(`🛠️ Development mode - Network: ${String(network)}`)
            logger.log(`📊 Contract pools: ${contractPools.length}, DB pools: ${dbPools?.length || 0}`)

            // Log status mapping for debugging
            logStatusMapping()

            // Log sample contract pools
            if (contractPools.length > 0) {
                logger.log('📋 Sample contract pools:')
                contractPools.slice(0, 3).forEach((pool, index) => {
                    logger.log(
                        `  ${index + 1}. Pool ${pool.id}: ${pool.name} (Status: ${pool.status}, Participants: ${pool.numParticipants})`,
                    )
                })
            }

            // Log sample database pools
            if (dbPools && dbPools.length > 0) {
                logger.log('📋 Sample database pools:')
                dbPools.slice(0, 3).forEach((pool, index) => {
                    const contractId = pool.contract_id ?? 'unknown'
                    const poolName = pool.name ?? 'unknown'
                    const poolStatus = pool.status ?? 'unknown'
                    logger.log(`  ${index + 1}. Pool ${contractId}: ${poolName} (Status: ${poolStatus})`)
                })
            }
        }

        // Log pools that exist in contract but not in DB
        const poolsNotInDb = contractPools.filter(
            contractPool => !dbPools?.some(dp => dp.contract_id === parseInt(contractPool.id)),
        )
        if (poolsNotInDb.length > 0) {
            logger.warn('⚠️ Pools in contract but not in DB:', {
                count: poolsNotInDb.length,
                pools: poolsNotInDb.map(pool => ({ id: pool.id, name: pool.name, status: pool.status })),
            })
        }

        // Log DB pools that would be visible with correct status mapping
        if (isDevelopment && isVerbose && dbPools) {
            const visibleDbPools = dbPools.filter(pool => isPoolStatusVisible(pool.status))
            logger.log(`👁️ DB pools with visible status: ${visibleDbPools.length}`)
            visibleDbPools.slice(0, 3).forEach(pool => {
                const contractStatus = mapDbStatusToContractStatus(pool.status)
                const contractId = pool.contract_id ?? 'unknown'
                const poolName = pool.name ?? 'unknown'
                const poolStatus = pool.status ?? 'unknown'
                logger.log(`  Pool ${contractId}: ${poolName} (${poolStatus} -> ${contractStatus})`)
            })
        }

        // Filter and process pools
        logger.log('🔍 Filtering contract pools...')
        const eligibleContractPools = contractPools.filter(pool => {
            const isEligible = (pool.status as POOLSTATUS) <= POOLSTATUS.DEPOSIT_ENABLED
            if (!isEligible) {
                logger.log(`❌ Pool ${pool.id} filtered out: status ${pool.status} > DEPOSIT_ENABLED`)
            }
            return isEligible
        })

        logger.log(`✅ Eligible contract pools: ${eligibleContractPools.length}/${contractPools.length}`)

        // Only display pools that have a corresponding DB record **and** whose DB status is visible.
        const visibilityFilteredPools = eligibleContractPools.filter(contractPool => {
            const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
            if (!dbPool) {
                logger.log(`❌ Pool ${contractPool.id} filtered out: no DB entry`)
                return false
            }

            const isVisible = isPoolStatusVisible(dbPool.status)
            if (!isVisible) {
                logger.log(`❌ Pool ${contractPool.id} filtered out: status not visible (${dbPool.status})`)
            }
            return isVisible
        })

        logger.log(`👁️ Visibility filtered pools: ${visibilityFilteredPools.length}/${eligibleContractPools.length}`)

        // Transform pools to UI format
        logger.log('🔄 Transforming pools to UI format...')
        const transformStart = performance.now()

        let transformedPools: PoolItem[] = []

        // ------------------------------------------------------------------
        // Transform according to selected filter mode
        // ------------------------------------------------------------------

        if (mode === 'intersection') {
            transformedPools = visibilityFilteredPools.map(contractPool => {
                const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))

                // If no DB pool found in development, create minimal data
                if (!dbPool && isDevelopment) {
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

        const transformTime = performance.now() - transformStart
        logger.log(`✅ Pools transformed in ${transformTime.toFixed(2)}ms (mode: ${mode})`)

        // Sort pools
        logger.log('📊 Sorting pools...')
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
        logger.log(`🎉 Fetch completed successfully:`, {
            totalPools: sortedPools.length,
            totalTime: `${totalTime.toFixed(2)}ms`,
            breakdown: {
                contractPoolsTime: `${contractPoolsTime.toFixed(2)}ms`,
                dbPoolsTime: `${dbPoolsTime.toFixed(2)}ms`,
                transformTime: `${transformTime.toFixed(2)}ms`,
            },
        })

        // Log final result summary
        if (sortedPools.length > 0) {
            logger.log('📋 Final pools summary:')
            sortedPools.slice(0, 5).forEach((pool, index) => {
                logger.log(`  ${index + 1}. ${pool.name} (ID: ${pool.id}, Status: ${pool.status})`)
            })
            if (sortedPools.length > 5) {
                logger.log(`  ... and ${sortedPools.length - 5} more pools`)
            }
        } else {
            logger.warn('⚠️ No pools returned after processing')
        }

        return sortedPools
    } catch (error) {
        logger.error('❌ Unhandled error in fetchUpcomingPools:', error)
        throw error // Re-throw to be caught by React Query
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

    // Retry logic based on network changes or manual refresh
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
