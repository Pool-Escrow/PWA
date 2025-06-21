import 'server-only'

import { cache } from 'react'
import { isParticipant } from '../../persistence/users/blockchain/is-participant'
import type { Address } from 'viem'

export const isParticipantUseCase = cache(async (address: Address, poolId: string): Promise<boolean | undefined> => {
    if (!address) return false

    return isParticipant({
        address,
        poolId,
    })
})
