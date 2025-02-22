import 'server-only'

import { cache } from 'react'
import type { Address } from 'viem'
import { isParticipant } from '../../persistence/users/blockchain/is-participant'

export const isParticipantUseCase = cache(async (address: Address, poolId: string): Promise<boolean | undefined> => {
    if (!address) return false

    return isParticipant({
        address,
        poolId,
    })
})
