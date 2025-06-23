import 'server-only'

import { db } from '../../../database/db'
import path from 'path'

export async function uploadAvatarToStorage(userId: string, avatar: File): Promise<string> {
    const fileExtension = path.extname(avatar.name).toLowerCase()
    const timestamp = Date.now()
    const fileName = `${userId}/avatar-${timestamp}${fileExtension}`

    const { error } = await db.storage.from('images').upload(fileName, avatar, {
        contentType: avatar.type,
        upsert: true, // overwrite existing file with same name
    })

    if (error) {
        throw new Error(`Error uploading avatar: ${error.message}`)
    }

    const { data: urlData } = db.storage.from('images').getPublicUrl(fileName)

    return urlData.publicUrl
}
