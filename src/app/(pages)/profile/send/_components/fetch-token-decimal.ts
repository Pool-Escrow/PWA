import { getConfig } from '@/app/_client/providers/configs/wagmi.config'
import { dropletAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import { Address } from 'viem'

export const fetchTokenDecimals = async ({ queryKey }: { queryKey: [string, string, number] }) => {
    const publicClient = getPublicClient(getConfig())
    const [_, tokenAddress] = queryKey
    const tokenDecimals = await publicClient?.readContract({
        abi: dropletAbi,
        functionName: 'decimals',
        address: tokenAddress as Address,
        args: [],
    })

    return { tokenDecimals }
}
