'use server'

import { verifyToken } from '@/server/auth/privy'
import { getAllPoolsUseCase } from '@/server/use-cases/pools/get-all-pools'
import { getAddressBalanceUseCase } from '@/server/use-cases/users/get-user-balance'
import type { Address } from 'viem'

/**
 * Get all pools for the current chain
 * This action is now chain-aware and will fetch pools based on the chain context
 */
export const getPoolsAction = async () => {
    return getAllPoolsUseCase()
}

// export const getUserNextPoolAction = async () => {
//     // authenticatedProcedure.createServerAction().handler(async ({ ctx: { user } }): Promise<PoolItem | undefined> => {
//     const user = await verifyToken()

//     const address = user?.wallet?.address as Address

//     return getUserNextPoolUseCase(address)
// }

export const getTokenBalanceAction = async () => {
    const user = await verifyToken()
    if (!user?.wallet?.address) {
        return undefined
    }

    const address = user.wallet.address as Address
    return getAddressBalanceUseCase(address)
}

// export const getAdminStatusAction = async () => {
//     // authenticatedProcedure.createServerAction().handler(async ({ ctx: { user } }) => {
//     const user = await verifyToken()

//     console.log('[getAdminStatusAction] user', user?.id)

//     const address = user?.wallet?.address as Address

//     console.log('[getAdminStatusAction] address', address)

//     return isAdminUseCase(address)
// }

export const getUserAddressAction = async () => {
    // authenticatedProcedure.createServerAction().handler(async ({ ctx: { user } }) => {
    const user = await verifyToken()

    return user?.wallet?.address as Address
}

// export async function getPoolsPageAction() {
//     const [[nextPool], [upcomingPools], [balance], [isAdmin], [userAddress]] = await Promise.all([
//         getUserNextPoolAction(),
//         getUpcomingPoolsAction(),
//         getTokenBalanceAction(),
//         getAdminStatusAction(),
//         getUserAddressAction(),
//     ])

//     return { nextPool, balance, pools: upcomingPools, isAdmin, userAddress }
// }
