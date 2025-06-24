import { serverConfig } from '@/server/blockchain/server-config'
import { tokenAbi } from '@/types/contracts'
import { getPublicClient } from '@wagmi/core'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'

export function getTokenSymbol(tokenAddress: Address, chainId?: number) {
    const client = getPublicClient(serverConfig, { chainId })
    if (!client) return undefined

    return client.readContract({
        address: tokenAddress,
        abi: [getAbiItem({ abi: tokenAbi, name: 'symbol' })],
        functionName: 'symbol',
    })
}

export function getTokenDecimals(tokenAddress: Address, chainId?: number) {
    const client = getPublicClient(serverConfig, { chainId })
    if (!client) return undefined

    return client.readContract({
        address: tokenAddress,
        abi: [getAbiItem({ abi: tokenAbi, name: 'decimals' })],
        functionName: 'decimals',
    })
}
