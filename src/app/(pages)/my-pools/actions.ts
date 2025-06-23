'use server'

import type { PoolItem } from '@/lib/entities/models/pool-item'
import { authenticatedProcedure } from '@/server/procedures/authenticated'
import { getUserPastPoolsUseCase, getUserUpcomingPoolsUseCase } from '@/server/use-cases/pools/get-user-pools'
import type { Address } from 'viem'

export const getUserUpcomingPoolsAction = authenticatedProcedure
    .createServerAction()
    .handler(async ({ ctx: { user } }): Promise<PoolItem[]> => {
        const address = user.wallet?.address as Address
        return getUserUpcomingPoolsUseCase(address)
    })

export const getUserPastPoolsAction = authenticatedProcedure
    .createServerAction()
    .handler(async ({ ctx: { user } }): Promise<PoolItem[]> => {
        const address = user.wallet?.address as Address
        return getUserPastPoolsUseCase(address)
    })

export async function getMyPoolsPageAction() {
    const [[upcomingPools], [pastPools]] = await Promise.all([getUserUpcomingPoolsAction(), getUserPastPoolsAction()])

    return { upcomingPools, pastPools }
}
