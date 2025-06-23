import { currentPoolAddress, serverConfig } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'

export const isParticipant = async ({
    address,
    poolId,
}: {
    address: Address
    poolId: string
}): Promise<boolean | undefined> => {
    const publicClient = getPublicClient(serverConfig)

    return publicClient?.readContract({
        abi: poolAbi,
        functionName: 'isParticipant',
        address: currentPoolAddress,
        args: [address, BigInt(poolId)],
    })
}
