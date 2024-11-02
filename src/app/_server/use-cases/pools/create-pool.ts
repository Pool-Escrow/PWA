import 'server-only'

import type { Address } from 'viem'
import { createPoolInDb } from '../../persistence/pools/db/create-db-pool'

interface PoolItem {
    name: string
    description: string
    bannerImage: File
    termsURL: string
    softCap: number
    startDate: number
    endDate: number
    price: number
    tokenAddress: Address
    requiredAcceptance: boolean
}

const createdPools = new Set<string>()

export async function createPoolUseCase(creatorAddress: Address, info: PoolItem) {
    const poolKey = `${creatorAddress}-${info.name}-${info.startDate}`
    if (createdPools.has(poolKey)) {
        console.log('Pool already created, skipping')
        return null
    }

    const createdPool = await createPoolInDb(creatorAddress, info)
    createdPools.add(poolKey)
    return createdPool.internal_id.toString()
}
