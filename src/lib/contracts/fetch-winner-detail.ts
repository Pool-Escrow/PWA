import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import { Address } from 'viem'

export const fetchWinnerDetail = async ({ queryKey }: { queryKey: [string, bigint, string, number] }) => {
    const publicClient = getPublicClient(wagmi.config)
    const [_, poolId, address] = queryKey
    const winnerDetailFromSC = await publicClient?.readContract({
        abi: poolAbi,
        functionName: 'getWinnerDetail',
        address: poolAddress[publicClient.chain.id as ChainId],
        args: [poolId, address as Address],
    })

    return { winnerDetailFromSC }
}
