import { currentPoolAddress, serverConfig } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'

export const isParticipant = async ({
    address,
    poolId,
}: {
    address: Address
    poolId: bigint
}): Promise<boolean | undefined> => {
    const publicClient = getPublicClient(serverConfig)

    return publicClient?.readContract({
        abi: poolAbi,
        functionName: 'isParticipant',
        address: currentPoolAddress,
        args: [address, poolId],
    })
}
