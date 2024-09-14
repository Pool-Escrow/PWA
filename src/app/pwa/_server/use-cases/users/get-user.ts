import 'server-only'

import type { Tables } from '@/types/db'
import { cache } from 'react'
import { getPrivyUser } from '../../auth/privy'
import { getDbUser } from '../../persistence/users/db/get-db-user'

type UserItem = Pick<Tables<'users'>, 'avatar' | 'displayName'>

export const getUserUseCase = cache(async (privyId?: string): Promise<UserItem | null> => {
    const privyUser = await getPrivyUser()

    const id = privyId || privyUser?.id

    if (!id) {
        console.log('[getUserUseCase] User not authenticated or address not available')
        return null
    }

    const user = await getDbUser(id)

    return {
        avatar: user?.avatar || null,
        displayName: user?.displayName || null,
    }
})
