import 'server-only'
import { db } from '../../../database/db'

// Import path dinamically to avoid bundling issues
const getFileExtension = (filename: string): string => {
    const lastDot = filename.lastIndexOf('.')
    return lastDot === -1 ? '' : filename.slice(lastDot)
}

export async function uploadAvatarToStorage(userId: string, avatar: File): Promise<string> {
    const fileExtension = getFileExtension(avatar.name).toLowerCase()
    const timestamp = Date.now()
    const fileName = `${userId}/avatar-${timestamp}${fileExtension}`

    const { error } = await db.storage.from('images').upload(fileName, avatar, {
        contentType: avatar.type,
        upsert: true,
    })

    if (error) {
        throw new Error(`Error uploading avatar: ${error.message}`)
    }

    const { data: urlData } = db.storage.from('images').getPublicUrl(fileName)

    return urlData.publicUrl
}
