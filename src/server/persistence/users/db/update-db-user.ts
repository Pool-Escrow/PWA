import 'server-only'

import { db } from '../../../database/db'
import { uploadAvatarToStorage } from '../storage/upload-avatar'

interface UserItem {
    avatar?: File | null | undefined
    displayName?: string
}

export async function updateUserInDb(userPrivyId: string, data: UserItem) {
    const updateData: {
        displayName?: string
        avatar?: string | null
    } = {}

    if (data.displayName !== undefined) {
        updateData.displayName = data.displayName
    }

    if (data.avatar !== undefined) {
        if (data.avatar instanceof File) {
            updateData.avatar = await uploadAvatarToStorage(userPrivyId, data.avatar)
        } else if (data.avatar === null) {
            updateData.avatar = null
        }
        // If data.avatar is undefined, we don't update the avatar field
    }

    if (Object.keys(updateData).length > 0) {
        const { error } = await db.from('users').update(updateData).eq('privyId', userPrivyId)

        if (error) {
            throw new Error(`Error updating user in database: ${error.message}`)
        }
    }
}
