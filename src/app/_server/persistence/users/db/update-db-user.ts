import 'server-only'

import { db } from '../../../database/db'
import { uploadAvatarToStorage } from '../storage/upload-avatar'

interface UserItem {
    avatar?: File | null | undefined
    displayName?: string
}

export async function updateUserInDb(userPrivyId: string, data: UserItem) {
    // Define correct types for database update
    interface DbUpdateData {
        displayName?: string | null
        avatar?: string | null
    }

    const updateData: DbUpdateData = {}

    if (data.displayName !== undefined) {
        updateData.displayName = data.displayName
    }

    if (data.avatar !== undefined) {
        if (data.avatar instanceof File) {
            // Upload avatar and store URL
            const avatarUrl = await uploadAvatarToStorage(userPrivyId, data.avatar)
            updateData.avatar = avatarUrl
        } else if (data.avatar === null) {
            // Clear avatar
            updateData.avatar = null
        }
    }

    if (Object.keys(updateData).length > 0) {
        const { error } = await db.from('users').update(updateData).eq('privyId', userPrivyId).single()

        if (error) {
            throw new Error(`Error updating user in database: ${error.message}`)
        }
    }
}
