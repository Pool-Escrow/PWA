'use server'

import type { Address } from 'viem'
import { validateRequest } from '../../_server/auth/auth'
import { authenticatedAction } from '../../_server/lib/safe-action'
import { getAllPoolsUseCase } from '../../_server/use-cases/pools/get-all-pools'
import { getUserNextPoolUseCase } from '../../_server/use-cases/pools/get-user-next-pool'

interface PoolItem {
    id: string
    name: string
    startDate: Date
    endDate: Date
    numParticipants: number
    status: string
    image: string
    softCap: number
}

export async function getAllPoolsAction(): Promise<PoolItem[]> {
    return getAllPoolsUseCase()
}

export const checkAuthStatusAction = authenticatedAction
    .createServerAction()
    .handler(
        async (): Promise<
            { isAdmin: boolean; authenticated: boolean; address: Address } | { needsRefresh: true } | null
        > => {
            const { session, needsRefresh } = await validateRequest()
            console.log('session', session)
            if (needsRefresh) {
                return { needsRefresh: true }
            }

            if (!session || !session.address) {
                throw new Error('User not authenticated or address not available')
            }

            return { isAdmin: session.isAdmin, authenticated: true, address: session.address }
        },
    )

// export async function getUpcomingPools(): Promise<PoolItem[]> {
//     return getUpcomingPoolsUseCase()
// }

export const getUserNextPoolAction = authenticatedAction
    .createServerAction()
    .handler(async (): Promise<PoolItem | { needsRefresh: true } | null> => {
        const { session, needsRefresh } = await validateRequest()

        if (needsRefresh) {
            return { needsRefresh: true }
        }

        if (!session || !session.address) {
            throw new Error('User not authenticated or address not available')
        }

        const nextPool = await getUserNextPoolUseCase(session.address)

        console.log('next pool', nextPool)

        return nextPool
    })
