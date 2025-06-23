import 'server-only'

import type { Tables } from '@/types/db'
import { getDbUser } from '../../persistence/users/db/get-db-user'

type UserItem = Pick<Tables<'users'>, 'avatar' | 'displayName'>

export const getUserUseCase = async (privyId: string): Promise<UserItem | null> => {
    return getDbUser(privyId)
}
