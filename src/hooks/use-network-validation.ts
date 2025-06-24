import { NEXT_PUBLIC_NETWORK } from '@/env.mjs'
import { useMemo } from 'react'
import { base, baseSepolia, type Chain } from 'viem/chains'
import { useChainId } from 'wagmi'

export interface NetworkValidation {
    currentChainId: number | undefined
    currentChain: Chain | undefined
    isCorrectNetwork: boolean
    expectedChain: Chain
    supportedChains: readonly Chain[]
    networkStatus: 'correct' | 'wrong' | 'unsupported' | 'unknown'
    shouldShowWarning: boolean
}

/**
 * Hook to validate the current network against the expected configuration
 */
export function useNetworkValidation(): NetworkValidation {
    const chainId = useChainId()

    const { supportedChains, expectedChain } = useMemo(() => {
        switch (NEXT_PUBLIC_NETWORK) {
            case 'mainnet':
                return {
                    supportedChains: [base] as const,
                    expectedChain: base,
                }
            case 'testnet':
            case 'development':
                return {
                    supportedChains: [base, baseSepolia] as const,
                    expectedChain: baseSepolia,
                }
            default:
                return {
                    supportedChains: [base, baseSepolia] as const,
                    expectedChain: baseSepolia,
                }
        }
    }, [])

    const currentChain = useMemo(() => {
        if (!chainId) return undefined
        return supportedChains.find(chain => chain.id === chainId)
    }, [chainId, supportedChains])

    const networkStatus = useMemo(() => {
        if (!chainId) return 'unknown'
        if (chainId === expectedChain.id) return 'correct'
        if (supportedChains.some(chain => chain.id === chainId)) return 'wrong'
        return 'unsupported'
    }, [chainId, expectedChain.id, supportedChains])

    const isCorrectNetwork = networkStatus === 'correct'
    const shouldShowWarning = networkStatus !== 'correct' && networkStatus !== 'unknown'

    return {
        currentChainId: chainId,
        currentChain,
        isCorrectNetwork,
        expectedChain,
        supportedChains,
        networkStatus,
        shouldShowWarning,
    }
}
