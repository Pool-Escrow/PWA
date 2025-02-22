import type { Tables } from '@/types/db'
import 'server-only'
import { db } from '../../../database/db'

interface PoolItem {
    name: string
    image: string
    startDate: Date
    endDate: Date
    status: Tables<'pools'>['status']
}

export async function updatePoolInDb(poolId: string, data: PoolItem) {
    const { error } = await db
        .from('pools')
        .update({
            bannerImage: data.image,
            name: data.name,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
            status: data.status,
        })
        .eq('id', poolId)

    if (error) {
        throw new Error(`Error updating pool in database: ${error.message}`)
    }
}
