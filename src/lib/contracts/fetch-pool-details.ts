import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'

export const fetchPoolDetails = async ({ queryKey }: { queryKey: [string, bigint, number] }) => {
    const publicClient = getPublicClient(wagmi.config)
    const [_, poolId] = queryKey
    const poolDetailFromSC = await publicClient?.readContract({
        abi: poolAbi,
        functionName: 'getAllPoolInfo',
        address: poolAddress[publicClient.chain.id as ChainId],
        args: [poolId],
    })

    return { poolDetailFromSC }
}
