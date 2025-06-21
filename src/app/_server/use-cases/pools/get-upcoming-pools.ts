import 'server-only'
import { getContractPools } from '../../persistence/pools/blockchain/get-contract-pools'
import { getDbPools } from '../../persistence/pools/db/get-db-pools'
import type { PoolItem } from '@/app/_lib/entities/models/pool-item'

const statusMap: Record<number, string> = {
    0: 'UPCOMING',
    1: 'DEPOSIT_ENABLED',
    2: 'STARTED',
    3: 'ENDED',
    4: 'DELETED',
}

export async function getAllPoolsUseCase(): Promise<PoolItem[]> {
    const [dbPools, contractPools] = await Promise.all([getDbPools(), getContractPools()])

    const allPools = dbPools.map(dbPool => {
        const contractPool = contractPools.find(cp => cp.id === dbPool.id)

        if (!contractPool) {
            throw new Error(`Pool ${dbPool.id} not found in contract data`)
        }

        return {
            id: contractPool.id.toString(),
            name: contractPool.name,
            startDate: new Date(contractPool.timeStart * 1000),
            endDate: new Date(contractPool.timeEnd * 1000),
            numParticipants: contractPool.numParticipants,
            status: statusMap[contractPool.status] || 'UNKNOWN',
            image: dbPool.image,
            softCap: dbPool.softCap,
        }
    })

    const now = new Date()
    return allPools.filter(pool => pool.startDate > now)
}
