import { dropTokenAddress, poolAddress, tokenAddress } from '@/types/contracts'
import type { Address } from 'viem'
import { useChainId } from 'wagmi'

/**
 * Hook that provides chain-aware contract addresses
 * This ensures that contract addresses update when the user switches chains
 */
export function useChainAwareContracts() {
    const chainId = useChainId()

    const currentPoolAddress = poolAddress[chainId as keyof typeof poolAddress] as Address
    const currentTokenAddress = tokenAddress[chainId as keyof typeof tokenAddress] as Address
    const currentDropTokenAddress = dropTokenAddress[chainId as keyof typeof dropTokenAddress] as Address

    return {
        poolAddress: currentPoolAddress,
        tokenAddress: currentTokenAddress,
        dropTokenAddress: currentDropTokenAddress,
        chainId,
    }
}
