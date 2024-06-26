import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'

export const fetchClaimablePools = async ({ queryKey }: { queryKey: [string, string, number] }) => {
    const [_, address] = queryKey
    const publicClient = getPublicClient(wagmi.config)

    const claimablePools = await publicClient?.readContract({
        abi: poolAbi,
        functionName: 'getClaimablePools',
        address: poolAddress[publicClient.chain.id as ChainId],
        args: [address as HexString],
    })

    return claimablePools
}
