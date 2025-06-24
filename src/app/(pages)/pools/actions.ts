'use server'

import { verifyToken } from '@/server/auth/privy'
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
