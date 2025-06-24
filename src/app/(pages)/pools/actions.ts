'use server'

import type { PoolItem } from '@/lib/entities/models/pool-item'
import { verifyToken } from '@/server/auth/privy'
import { getUserUpcomingPoolsUseCase } from '@/server/use-cases/pools/get-user-pools'
import { getAddressBalanceUseCase } from '@/server/use-cases/users/get-user-balance'
import { revalidateTag } from 'next/cache'
import type { Address } from 'viem'

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
 * Enhanced with better error handling to prevent query failures during auth timing issues
 */
export async function getUserNextPoolsAction(chainId: number): Promise<{
    pools: PoolItem[]
    metadata: {
        totalUserPools: number
        upcomingUserPools: number
        visibleUserPools: number
        hasValidUser: boolean
    }
}> {
    try {
        // Get current user from Privy with enhanced error handling
        const user = await verifyToken().catch((authError: Error) => {
            if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
                console.log(
                    '[getUserNextPoolsAction] Auth verification failed (normal during session setup):',
                    authError.message,
                )
            }
            return null // Return null instead of throwing to handle auth timing gracefully
        })

        if (!user?.wallet?.address) {
            if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
                console.log('[getUserNextPoolsAction] No authenticated user found - returning empty data')
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
            console.log('[getUserNextPoolsAction] 🚀 Fetching user pools for:', userAddress, 'on chain', chainId)
        }

        // Use the server-side use case with the provided chainId
        const userPools = await getUserUpcomingPoolsUseCase(userAddress, chainId)

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
        // Enhanced error logging for debugging
        if (process.env.NODE_ENV === 'development') {
            console.error('[getUserNextPoolsAction] ❌ Unexpected error:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
            })
        }

        // Always return empty data structure instead of throwing
        // This prevents the Tanstack Query from entering error state
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
