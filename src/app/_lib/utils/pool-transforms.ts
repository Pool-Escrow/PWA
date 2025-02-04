import { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { ContractPool } from '@/app/_server/persistence/pools/blockchain/get-contract-pools'

export function transformContractPoolToUIPool(
    contractPool: ContractPool,
    dbPool?: { bannerImage?: string; softCap?: number },
): PoolItem {
    return {
        id: contractPool.id,
        name: contractPool.name,
        image: dbPool?.bannerImage ?? '',
        startDate: new Date(contractPool.timeStart * 1000),
        endDate: new Date(contractPool.timeEnd * 1000),
        status: contractPool.status as POOLSTATUS,
        numParticipants: contractPool.numParticipants,
        softCap: dbPool?.softCap ?? 0,
    }
}
