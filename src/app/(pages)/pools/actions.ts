'use server'

import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { createSupabaseServerClient } from '@/lib/supabase'
import { isPoolStatusVisible } from '@/lib/utils/pool-status-mapping'
import { transformContractPoolToUIPool } from '@/lib/utils/pool-transforms'
import { verifyToken } from '@/server/auth/privy'
import type { ContractPool } from '@/server/persistence/pools/blockchain/get-contract-pools'
import { getContractPools } from '@/server/persistence/pools/blockchain/get-contract-pools'
import { getAllPoolsUseCase } from '@/server/use-cases/pools/get-all-pools'
import { getUserUpcomingPoolsUseCase } from '@/server/use-cases/pools/get-user-pools'
import { getAddressBalanceUseCase } from '@/server/use-cases/users/get-user-balance'
import type { Database } from '@/types/db'
import { revalidateTag } from 'next/cache'
import type { Address } from 'viem'

type DbPool = Database['public']['Tables']['pools']['Row']

/**
 * Get all pools for the current chain
 * This action is now chain-aware and will fetch pools based on the chain context
 */
export const getPoolsAction = async () => {
    return getAllPoolsUseCase()
}

/**
 * Get upcoming pools with improved error handling and data consistency
 * This action combines blockchain and database data following T3 patterns
 */
export const getUpcomingPoolsAction = async (
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
                console.warn('[getUpcomingPoolsAction] Contract fetch failed:', error.message)
                return [] as ContractPool[] // Graceful fallback
            }),
            createSupabaseServerClient()
                .from('pools')
                .select('*')
                .then((result: { data: DbPool[] | null; error: Error | null }) => {
                    if (result.error) {
                        console.error('[getUpcomingPoolsAction] Database fetch failed:', result.error)
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

        // Log raw data for debugging
        // if (process.env.NODE_ENV === 'development') {
        //     console.log('[getUpcomingPoolsAction] 🔍 Raw Data Analysis:', {
        //         contractPoolsCount: contractPools.length,
        //         dbPoolsCount: dbPools.length,
        //         sampleContractPools: contractPools.slice(0, 3).map(p => ({
        //             id: p.id,
        //             name: p.name,
        //             status: p.status,
        //             statusName: POOLSTATUS[p.status] || `Unknown(${p.status})`,
        //             participants: p.numParticipants,
        //         })),
        //         sampleDbPools: dbPools.slice(0, 3).map(p => ({
        //             contract_id: p.contract_id,
        //             status: p.status,
        //             bannerImage: !!p.bannerImage,
        //             softCap: p.softCap,
        //         })),
        //     })
        // }

        // Filter contract pools by status first (eligible pools)
        const eligibleContractPools = contractPools.filter((pool: ContractPool) => {
            const isEligible = (pool.status as POOLSTATUS) <= POOLSTATUS.DEPOSIT_ENABLED
            // if (process.env.NODE_ENV === 'development') {
            //     console.log(
            //         `[getUpcomingPoolsAction] Pool ${pool.id} (${pool.name}): status=${pool.status} (${POOLSTATUS[pool.status]}), eligible=${isEligible}`,
            //     )
            // }
            return isEligible
        })

        if (process.env.NODE_ENV === 'development') {
            console.log('[getUpcomingPoolsAction] 📊 Filtering Results:', {
                totalContractPools: contractPools.length,
                eligibleContractPools: eligibleContractPools.length,
                filteredOut: contractPools.length - eligibleContractPools.length,
            })
        }

        // Find pools that exist in both contract and database with visible status
        const syncedhPools = eligibleContractPools
            .map((contractPool: ContractPool) => {
                const dbPool = dbPools.find((dp: DbPool) => dp.contract_id === parseInt(contractPool.id))

                // if (process.env.NODE_ENV === 'development') {
                //     console.log(`[getUpcomingPoolsAction] 🔄 Syncing pool ${contractPool.id}:`, {
                //         contractPool: {
                //             id: contractPool.id,
                //             name: contractPool.name,
                //             status: contractPool.status,
                //         },
                //         dbPool: dbPool
                //             ? {
                //                   contract_id: dbPool.contract_id,
                //                   status: dbPool.status,
                //                   hasImage: !!dbPool.bannerImage,
                //                   softCap: dbPool.softCap,
                //               }
                //             : null,
                //         existsInDb: !!dbPool,
                //         isVisible: dbPool ? isPoolStatusVisible(dbPool.status) : false,
                //         willInclude: !!(dbPool && isPoolStatusVisible(dbPool.status)),
                //     })
                // }

                // Must exist in database and have visible status
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
        console.error('[getUpcomingPoolsAction] Unexpected error:', error)
        throw new Error(`Failed to fetch upcoming pools: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Get token balance for authenticated user
 */
export const getTokenBalanceAction = async () => {
    const user = await verifyToken()
    if (!user?.wallet?.address) {
        return undefined
    }

    const address = user.wallet.address as Address
    return getAddressBalanceUseCase(address)
}

/**
 * Get user wallet address
 */
export const getUserAddressAction = async () => {
    const user = await verifyToken()
    return user?.wallet?.address as Address
}

/**
 * Revalidate pools data cache
 */
export const revalidatePoolsAction = async () => {
    await Promise.all([revalidateTag('pools'), revalidateTag('upcoming-pools')])
}

/**
 * Server action to get user's next pools (upcoming pools that the user has joined)
 * This provides a robust, server-side implementation for fetching user pool data
 */
export async function getUserNextPoolsAction(): Promise<{
    pools: PoolItem[]
    metadata: {
        totalUserPools: number
        upcomingUserPools: number
        visibleUserPools: number
        hasValidUser: boolean
    }
}> {
    try {
        // Get current user from Privy
        const user = await verifyToken()

        if (!user?.wallet?.address) {
            if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
                console.log('[getUserNextPoolsAction] No authenticated user found')
            }
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

        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
            console.log('[getUserNextPoolsAction] 🚀 Fetching user pools for:', userAddress)
        }

        // Use the server-side use case that we know works
        const userPools = await getUserUpcomingPoolsUseCase(userAddress)

        // The userPools are already PoolItem[] from the use case, no need to transform
        const sortedPools = userPools.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()).slice(0, 3) // Limit to next 3 pools

        const metadata = {
            totalUserPools: userPools.length,
            upcomingUserPools: userPools.length,
            visibleUserPools: sortedPools.length,
            hasValidUser: true,
        }

        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
            console.log('[getUserNextPoolsAction] ✅ Success:', metadata)
        }

        return {
            pools: sortedPools,
            metadata,
        }
    } catch (error) {
        console.error('[getUserNextPoolsAction] ❌ Error:', error)

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
