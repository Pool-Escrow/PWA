import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'

export const fetchWinnerDetail = async ({ queryKey }: { queryKey: [string, bigint, Address] }) => {
    const publicClient = getPublicClient(getConfig())
    const [_, poolId, address] = queryKey
    const winnerDetailFromSC = await publicClient?.readContract({
        abi: poolAbi,
        address: currentPoolAddress,
        functionName: 'getWinnerDetail',
        args: [poolId, address],
    })
    return { winnerDetailFromSC }
}
