import 'server-only'
import type { Address } from 'viem'
import { db } from '../../../database/db'

export async function getUserPools(userAddress: Address) {
    console.log('-- getUserPools --- ')
    const { data: userPools, error } = await db
        .from('pool_participants')
        .select('pool_id')
        .or(`user_id.eq.${userAddress},poolRole.eq.mainHost`)

    if (error) {
        throw new Error(`Error fetching user pools from database: ${error.message}`)
    }

    return userPools.map(pool => pool.pool_id)
}
