'use server'

import type { Address } from 'viem'
import { authenticatedProcedure } from '../../_server/procedures/authenticated'
import type { PoolItem } from '../../_lib/entities/models/pool-item'
import { getUserUpcomingPoolsUseCase, getUserPastPoolsUseCase } from '../../_server/use-cases/pools/get-user-pools'

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
