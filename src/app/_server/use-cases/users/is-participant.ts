import 'server-only'

import { cache } from 'react'
import { isParticipant } from '../../persistence/users/blockchain/is-participant'
import { Address } from 'viem'

export const isParticipantUseCase = cache(async (address: Address, poolId: bigint): Promise<boolean | undefined> => {
    if (!address) return false

    return isParticipant({
        address,
        poolId,
    })
})
