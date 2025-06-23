import 'server-only'

import type { Address } from 'viem'
import { getUserPools } from '../../persistence/pools/blockchain/get-contract-user-pools'
import { getDbPools } from '../../persistence/pools/db/get-db-pools'

interface PoolItem {
    id: string
    name: string
    image: string
    startDate: Date
    endDate: Date
    status: string
    numParticipants: number
    softCap: number
}

const statusMap: Record<number, string> = {
    0: 'INACTIVE',
    1: 'DEPOSIT_ENABLED',
    2: 'STARTED',
    3: 'ENDED',
    4: 'DELETED',
}

export const getUserNextPoolUseCase = async (userAddress: Address): Promise<PoolItem | undefined> => {
    const [userPools, dbPools] = await Promise.all([getUserPools(userAddress), getDbPools()])

    const validPools = userPools
        .filter(
            (pool): pool is NonNullable<typeof pool> =>
                pool !== null && pool !== undefined && (pool.status === 1 || pool.status === 2), // DEPOSIT_ENABLED or STARTED
        )
        .map(pool => {
            const dbPool = dbPools.find(dp => dp.id === pool.id)
            return {
                id: pool.id,
                name: pool.name,
                image: dbPool?.image ?? '',
                startDate: new Date(pool.timeStart * 1000),
                endDate: new Date(pool.timeEnd * 1000),
                status: statusMap[pool.status] || 'UNKNOWN',
                numParticipants: pool.numParticipants,
                softCap: dbPool?.softCap ?? 0,
            }
        })

    // Sort first by startDate, then by endDate
    const [nextUpcomingPool] = validPools.sort((a, b) => {
        if (a.startDate.getTime() !== b.startDate.getTime()) {
            return a.startDate.getTime() - b.startDate.getTime()
        }
        return a.endDate.getTime() - b.endDate.getTime()
    })

    // Return the next pool joined by the user
    return nextUpcomingPool
}
