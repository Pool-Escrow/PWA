import 'server-only'

import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'
import { currentPoolAddress, serverConfig } from '../../../blockchain/server-config'
import { poolAbi } from '@/types/contracts'

export const fetchClaimablePools = async ({ queryKey }: { queryKey: [string, string, number] }) => {
    const [_, address] = queryKey
    const publicClient = getPublicClient(serverConfig)

    const claimablePools = await publicClient?.readContract({
        abi: poolAbi,
        functionName: 'getClaimablePools',
        address: currentPoolAddress,
        args: [address as Address],
    })

    return claimablePools
}
