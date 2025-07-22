import { useDebugStore } from '@/stores/debug.store'
import { dropTokenAddress as dropTokenAddresses, tokenAddress } from '@/types/contracts'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { useBalance, useChainId } from 'wagmi'
import { useNetworkValidation } from './use-network-validation'

interface SharedBalanceData {
    usdc: {
        value: bigint
        decimals: number
        symbol: string
        formatted: string
        isLoading: boolean
        error: unknown
    }
    drop: {
        value: bigint
        decimals: number
        symbol: string
        formatted: string
        isLoading: boolean
        error: unknown
    }
    isAnyLoading: boolean
    hasAnyError: boolean
    canFetch: boolean
}

const ZERO_BALANCE = {
    value: BigInt(0),
    decimals: 18,
    symbol: '',
    formatted: '0',
    isLoading: false,
    error: null,
}

/**
 * Centralized balance hook that prevents duplicate queries across components
 * Uses React Query to share balance data between all components that need it
 */
export function useSharedBalance(component: string): SharedBalanceData {
    const { trackRequest } = useDebugStore()
    const { user } = usePrivy()
    const chainId = useChainId()
    const { currentChainId, isCorrectNetwork } = useNetworkValidation()

    const address = user?.wallet?.address as Address

    // Get chain-specific token addresses
    const usdcTokenAddress = currentChainId
        ? (tokenAddress[currentChainId as keyof typeof tokenAddress] as Address)
        : undefined
    const dropTokenAddress = currentChainId
        ? (dropTokenAddresses[currentChainId as keyof typeof dropTokenAddresses] as Address)
        : undefined

    // Prerequisites for fetching balances
    const canFetch = Boolean(address && usdcTokenAddress && dropTokenAddress && isCorrectNetwork && address !== '0x')

    // Track this component's balance request intent
    if (process.env.NODE_ENV === 'development' && canFetch) {
        trackRequest(component, 'useBalance', {
            token: 'USDC+DROP',
            address,
            stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
        })
    }

    // USDC Balance Query (shared across all components)
    const usdcQuery = useQuery({
        queryKey: ['shared-balance-usdc', address, usdcTokenAddress, chainId, canFetch],
        queryFn: () => {
            if (!canFetch) return null

            // This is a trigger for enabling the actual useBalance hook below
            return {
                trigger: 'usdc',
                address,
                token: usdcTokenAddress,
                chainId,
            }
        },
        enabled: canFetch,
        staleTime: 60_000, // 1 minute
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
    })

    // DROP Balance Query (shared across all components)
    const dropQuery = useQuery({
        queryKey: ['shared-balance-drop', address, dropTokenAddress, chainId, canFetch],
        queryFn: () => {
            if (!canFetch) return null

            return {
                trigger: 'drop',
                address,
                token: dropTokenAddress,
                chainId,
            }
        },
        enabled: canFetch,
        staleTime: 60_000, // 1 minute
        gcTime: 300_000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: false,
    })

    // Actual balance hooks - these will be called only once per app due to React Query caching
    const {
        data: usdcBalanceData,
        isLoading: usdcLoading,
        error: usdcError,
    } = useBalance({
        address,
        token: usdcTokenAddress,
        query: {
            enabled: canFetch && !!usdcQuery.data,
            staleTime: 60_000,
            gcTime: 300_000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false,
        },
    })

    const {
        data: dropBalanceData,
        isLoading: dropLoading,
        error: dropError,
    } = useBalance({
        address,
        token: dropTokenAddress,
        query: {
            enabled: canFetch && !!dropQuery.data,
            staleTime: 60_000,
            gcTime: 300_000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false,
        },
    })

    // Format the results
    const usdcBalance = usdcBalanceData
        ? {
              value: usdcBalanceData.value,
              decimals: usdcBalanceData.decimals,
              symbol: 'USDC',
              formatted: usdcBalanceData.formatted,
              isLoading: usdcLoading,
              error: usdcError,
          }
        : { ...ZERO_BALANCE, symbol: 'USDC', isLoading: usdcLoading, error: usdcError }

    const dropBalance = dropBalanceData
        ? {
              value: dropBalanceData.value,
              decimals: dropBalanceData.decimals,
              symbol: 'DROP',
              formatted: dropBalanceData.formatted,
              isLoading: dropLoading,
              error: dropError,
          }
        : { ...ZERO_BALANCE, symbol: 'DROP', isLoading: dropLoading, error: dropError }

    return {
        usdc: usdcBalance,
        drop: dropBalance,
        isAnyLoading: usdcLoading || dropLoading,
        hasAnyError: !!usdcError || !!dropError,
        canFetch,
    }
}
