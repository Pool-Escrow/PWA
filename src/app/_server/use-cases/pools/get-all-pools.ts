import 'server-only'

import { getContractPools } from '../../persistence/pools/blockchain/get-contract-pools'
import { getDbPools } from '../../persistence/pools/db/get-db-pools'

interface PoolItem {
    id: string
    name: string
    startDate: Date
    endDate: Date
    numParticipants: number
    status: string
    image: string
    softCap: number
}

const statusMap: Record<number, string> = {
    0: 'INACTIVE',
    1: 'DEPOSIT_ENABLED',
    2: 'STARTED',
    3: 'ENDED',
    4: 'DELETED',
}

export const getAllPoolsUseCase = async (): Promise<PoolItem[]> => {
    const [contractPools, dbPools] = await Promise.all([getContractPools(), getDbPools()])

    let invalidPools: string[] = []

    const validPools = contractPools
        .filter(
            (pool): pool is NonNullable<typeof pool> =>
                pool !== null && pool !== undefined && (pool.status === 1 || pool.status === 2), // DEPOSIT_ENABLED or STARTED
        )
        .map(pool => {
            const dbPool = dbPools.find(dp => dp.id === pool.id)

            if (!dbPool) {
                invalidPools.push(pool.id)
            }

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

    if (invalidPools.length > 0) {
        console.warn(
            'Pools with the following ids were not found in the database and were not included: ',
            invalidPools,
        )
        console.warn('Please, remove them from the contract or create them in the database to remove this warning.')
    }

    // Sort first by startDate, then by endDate
    const sortedPools = validPools.sort((a, b) => {
        if (a.startDate.getTime() !== b.startDate.getTime()) {
            return a.startDate.getTime() - b.startDate.getTime()
        }
        return a.endDate.getTime() - b.endDate.getTime()
    })

    return sortedPools
}
