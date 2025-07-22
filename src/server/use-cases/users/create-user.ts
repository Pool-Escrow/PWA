import 'server-only'

import type { Address } from 'viem'
import { createUserInDb } from '../../persistence/users/db/create-db-user'

interface UserInfo {
    walletAddress: Address
    role: 'admin' | 'user'
    displayName?: string
    avatar?: string
}

interface UserItem {
    privyId: string
    info: UserInfo
}

export async function createProfileUseCase({ privyId, info }: UserItem) {
    return createUserInDb({ privyId, info })
}
