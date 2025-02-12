import 'server-only'
import { Address } from 'viem'
import { getUserPools } from '../../persistence/pools/blockchain/get-contract-user-pools'
import { getDbPools } from '../../persistence/pools/db/get-db-pools'
import { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

const statusMap: Record<number, string> = {
    0: 'INACTIVE',
    1: 'DEPOSIT_ENABLED',
    2: 'STARTED',
    3: 'ENDED',
    4: 'DELETED',
}

async function getUserPoolsUseCase(userAddress: Address): Promise<PoolItem[]> {
    const [userPools, dbPools] = await Promise.all([getUserPools(userAddress), getDbPools()])

    return userPools
        .filter((pool): pool is NonNullable<typeof pool> => pool !== null && pool !== undefined)
        .map(pool => {
            const dbPool = dbPools.find(dp => dp.id === pool.id)
            return {
                id: pool.id,
                name: pool.name,
                image: dbPool?.image ?? '',
                startDate: new Date(pool.timeStart * 1000),
                endDate: new Date(pool.timeEnd * 1000),
                status: pool.status,
                numParticipants: pool.numParticipants,
                softCap: dbPool?.softCap ?? 0,
            }
        })
}

export const getUserUpcomingPoolsUseCase = async (userAddress: Address): Promise<PoolItem[]> => {
    const pools = await getUserPoolsUseCase(userAddress)
    const now = new Date()
    return pools.filter(pool => pool.status !== POOLSTATUS.ENDED && pool.status !== POOLSTATUS.DELETED).sort((a, b)=> b.startDate.getTime() - a.startDate.getTime())
}

export const getUserPastPoolsUseCase = async (userAddress: Address): Promise<PoolItem[]> => {
    const pools = await getUserPoolsUseCase(userAddress)
    const now = new Date()
    return pools.filter(pool => pool.status === POOLSTATUS.ENDED).sort((a, b)=> b.endDate.getTime() - a.endDate.getTime())
}
