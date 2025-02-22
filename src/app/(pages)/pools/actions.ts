'use server'

// import { authenticatedProcedure } from '../../_server/procedures/authenticated'
import { getAllPoolsUseCase } from '../../_server/use-cases/pools/get-all-pools'
// import { getUserNextPoolUseCase } from '../../_server/use-cases/pools/get-user-next-pool'
// import { unauthenticatedProcedure } from '../../_server/procedures/unauthenticated'
import { getAddressBalanceUseCase } from '../../_server/use-cases/users/get-user-balance'
// import { isAdminUseCase } from '../../_server/use-cases/users/is-admin'
import type { Address } from 'viem'
// import type { PoolItem } from '../../_lib/entities/models/pool-item'
import { verifyToken } from '../../_server/auth/privy'

export const getUpcomingPoolsAction = async () => {
    // unauthenticatedProcedure.createServerAction().handler(async (): Promise<PoolItem> => {
    return getAllPoolsUseCase()
}

// export const getUserNextPoolAction = async () => {
//     // authenticatedProcedure.createServerAction().handler(async ({ ctx: { user } }): Promise<PoolItem | undefined> => {
//     const user = await verifyToken()

//     const address = user?.wallet?.address as Address

//     return getUserNextPoolUseCase(address)
// }

export const getTokenBalanceAction = async () => {
    // authenticatedProcedure.createServerAction().handler(async ({ ctx: { user } }) => {
    const user = await verifyToken()

    const address = user?.wallet?.address as Address
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
