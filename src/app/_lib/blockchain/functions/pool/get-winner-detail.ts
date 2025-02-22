import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'

export const getWinnerDetail = async ({ queryKey }: { queryKey: [string, string, string, number] }) => {
    const publicClient = getPublicClient(getConfig())

    const [_, poolId, address] = queryKey

    const winnerDetailFromSC = await publicClient?.readContract({
        abi: poolAbi,
        functionName: 'getWinnerDetail',
        address: currentPoolAddress,
        args: [BigInt(poolId), address as Address],
    })

    return { winnerDetailFromSC }
}
