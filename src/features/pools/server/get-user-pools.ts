import 'server-only'

import type { PoolItem } from '@/lib/entities/models/pool-item'
import { getDb } from '@/server/database/db'
import type { Address } from 'viem'

/**
 * Fetches pools for a given user based on their status (upcoming or past).
 *
 * This function first retrieves the IDs of all pools the user has participated in
 * by joining `pool_participants` and `users` tables. Then, based on the `status`
 * parameter, it fetches the corresponding pool details from the `pools` table.
 *
 * @param {Address} userAddress - The wallet address of the user.
 * @param {'upcoming' | 'past'} status - The status of the pools to fetch.
 * @param {number} [chainId] - The ID of the chain to fetch pools from.
 * @returns {Promise<PoolItem[]>} A promise that resolves to an array of pool items.
 */
export async function getUserPools(
    userAddress: Address,
    status: 'upcoming' | 'past',
    chainId?: number,
): Promise<PoolItem[]> {
    // 1. Find all pool IDs the user has participated in.
    const { data: userParticipations, error: userPoolsError } = await getDb()
        .from('pool_participants')
        .select('pool_id, users!inner(walletAddress)')
        .eq('users.walletAddress', userAddress)

    if (userPoolsError) {
        console.error('[getUserPools] Error fetching user pool participation:', userPoolsError)
        return []
    }

    if (!userParticipations || userParticipations.length === 0) {
        return []
    }

    const poolIds = userParticipations.map(p => p.pool_id).filter((id): id is number => id !== null)

    if (poolIds.length === 0) {
        return []
    }

    // 2. Fetch pools based on the IDs and status
    const now = new Date().toISOString()

    const query = getDb()
        .from('pools')
        .select('*')
        .in('id', poolIds) // Filter by the pools the user is part of
        .order('startDate', { ascending: status === 'upcoming' })

    // // Filter by chain if chainId is provided
    // if (contractAddress) {
    //     query.eq('tokenAddress', contractAddress)
    // }

    if (status === 'upcoming') {
        query.gte('endDate', now)
    } else {
        query.lt('endDate', now)
    }

    console.log('query', query)

    const { data: pools, error: poolsError } = await query

    if (poolsError) {
        console.error(`[getUserPools] Error fetching ${status} pools:`, poolsError)
        return []
    }

    return (pools as unknown as PoolItem[]) || []
}

export async function getUserUpcomingPoolsUseCase(userAddress: Address, chainId?: number): Promise<PoolItem[]> {
    return getUserPools(userAddress, 'upcoming', chainId)
}

export async function getUserPastPoolsUseCase(userAddress: Address, chainId?: number): Promise<PoolItem[]> {
    return getUserPools(userAddress, 'past', chainId)
}
