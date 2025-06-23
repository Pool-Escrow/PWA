import type { Tables } from '@/types/db'
import 'server-only'
import { getDbPool } from '../../persistence/pools/db/get-db-pool'
import { updatePoolInDb } from '../../persistence/pools/db/update-db-pool'

interface PoolItem {
    name: string
    image: string
    startDate: Date
    endDate: Date
    status: Tables<'pools'>['status']
}

export async function updatePoolInfoUseCase(userId: string, poolId: string, info: PoolItem) {
    const pool = await getDbPool(poolId)

    if (!pool) {
        throw new Error('Pool not found')
    }

    //   if (pool. !== userId) {
    //     throw new Error('Unauthorized')
    //   }

    await updatePoolInDb(poolId, info)
}
