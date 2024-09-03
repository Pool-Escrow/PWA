'use server'

import type { Tables } from '@/types/db'
import { validateRequest } from '../../_server/auth/auth'
import { authenticatedAction } from '../../_server/lib/safe-action'
import { getUserUseCase } from '../../_server/use-cases/users/get-user'
import { getAddressBalanceUseCase } from '../../_server/use-cases/users/get-user-balance'

export const getAddressBalanceAction = authenticatedAction
    .createServerAction()
    .handler(
        async (): Promise<{ balance: bigint; symbol: string; decimals: number } | { needsRefresh: true } | null> => {
            const { session, needsRefresh } = await validateRequest()

            if (needsRefresh) {
                return { needsRefresh: true }
            }

            if (!session || !session.address) {
                throw new Error('User not authenticated or address not available')
            }

            return getAddressBalanceUseCase(session.address)
        },
    )

type UserItem = Pick<Tables<'users'>, 'avatar' | 'displayName'>

export const getUserInfoAction = async () => {
    const { session, needsRefresh } = await validateRequest()

    if (needsRefresh) {
        return { error: 'needsRefresh' }
    }

    if (!session || !session.address) {
        return { error: 'User not authenticated or address not available' }
    }

    const user = await getUserUseCase()
    return { data: user }
}
