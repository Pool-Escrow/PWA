import type { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { mapDbStatusToContractStatus } from '@/lib/utils/pool-status-mapping'
import type { ContractPool } from '@/server/persistence/pools/blockchain/get-contract-pools'
import type { Database } from '@/types/db'

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

// Type alias for a database pool row
type DbPoolRow = Database['public']['Tables']['pools']['Row']

/**
 * Transforms a database pool row (from Supabase) into the unified UI PoolItem
 * structure. This allows displaying pools that have not yet been deployed on-
 * chain (draft / inactive pools) while keeping the same front-end contract.
 */
export function transformDbPoolToUIPool(dbPool: DbPoolRow): PoolItem {
    return {
        // Use the on-chain contract_id when available, otherwise fall back to
        // the internal_id to guarantee a stable identifier.
        id: (dbPool.contract_id ?? dbPool.internal_id).toString(),
        name: dbPool.name,
        image: dbPool.bannerImage ?? '',
        startDate: new Date(dbPool.startDate),
        endDate: new Date(dbPool.endDate),
        status: mapDbStatusToContractStatus(dbPool.status),
        // Participant information is unavailable off-chain – default to 0.
        numParticipants: 0,
        softCap: dbPool.softCap ?? 0,
    }
}
