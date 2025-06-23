import 'server-only'

import { db } from '../../../database/db'

interface PoolItem {
    description: string
    id: string
    image: string
    status: string
    softCap: number
}

export async function getDbPools(): Promise<PoolItem[]> {
    const { data: poolsData, error } = await db
        .from('pools')
        .select('name, contract_id, description, status, bannerImage, softCap')
        .order('startDate', { ascending: true })

    if (error) {
        throw new Error(`Error fetching pools from database: ${error.message}`)
    }

    return poolsData
        .map(pool => {
            if (!pool.contract_id) {
                return null
            }

            return {
                description: pool.description,
                id: pool.contract_id.toString(),
                image: pool.bannerImage,
                status: pool.status,
                softCap: pool.softCap,
            }
        })
        .filter(Boolean) as PoolItem[]
}
