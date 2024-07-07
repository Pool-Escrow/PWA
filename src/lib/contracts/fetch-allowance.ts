import { wagmi } from '@/providers/configs'
import { poolAbi, poolAddress } from '@/types/contracts'
import { dropletAbi, dropletAddress } from '@/types/droplet'
import { getPublicClient } from '@wagmi/core'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const fetchAllowance = async ({ queryKey }: { queryKey: [string, string] }) => {
    const publicClient = getPublicClient(wagmi.config)
    const address = queryKey[1]

    const data = await publicClient?.readContract({
        address: dropletAddress[wagmi.config.state.chainId as ChainId],
        abi: dropletAbi,
        functionName: 'allowance',
        args: [address as Address, poolAddress[wagmi.config.state.chainId as ChainId]],
    })

    return { data }
}
