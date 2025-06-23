import 'server-only'

import { db } from '../../../database/db'

export async function uploadBannerImageToStorage(poolId: string, bannerImage: File): Promise<string> {
    const fileName = `${poolId}/bannerImage.png`

    const { error } = await db.storage.from('images').upload(fileName, bannerImage, {
        contentType: 'image/png',
        upsert: true, // overwrite existing file with same name
    })

    if (error) {
        throw new Error(`Error uploading banner image: ${error.message}`)
    }

    const { data: urlData } = db.storage.from('images').getPublicUrl(`${poolId}/bannerImage.png`)

    return urlData.publicUrl
}
