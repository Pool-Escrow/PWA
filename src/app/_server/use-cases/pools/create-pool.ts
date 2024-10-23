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
}

export async function createPoolUseCase(creatorAddress: Address, info: PoolItem) {
    const createdPool = await createPoolInDb(creatorAddress, info)
    return createdPool.internal_id.toString()
}
