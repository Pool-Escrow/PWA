import 'server-only'

import { getDbUser } from '../../persistence/users/db/get-db-user'
import { updateUserInDb } from '../../persistence/users/db/update-db-user'

interface UserItem {
    avatar?: File | null | undefined
    displayName?: string
}

export const updateProfileUseCase = async (userId: string, info: UserItem) => {
    const profile = await getDbUser(userId)
    if (!profile) {
        throw new Error('Profile not found')
    }

    const updateData: UserItem = {}
    if (info.displayName !== undefined) updateData.displayName = info.displayName
    if (info.avatar !== undefined) updateData.avatar = info.avatar

    await updateUserInDb(userId, updateData)
}
