import { ROLES } from '@/server/persistence/users/blockchain/has-role'
import { poolAbi } from '@/types/contracts'
import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { getAbiItem } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { useChainAwareContracts } from './use-chain-aware-contracts'

/**
 * Hook to check if the current user has admin role
 * Now chain-aware - will check admin status on the current chain
 */
export const useIsAdmin = () => {
    const { user, authenticated, ready } = usePrivy()
    const { isConnected } = useAccount()
    const address = user?.wallet?.address as Address | undefined
    const { poolAddress, chainId } = useChainAwareContracts()
    const [hasInitialized, setHasInitialized] = useState(false)

    // Wait for everything to be properly initialized
    useEffect(() => {
        if (ready && authenticated && address && poolAddress && chainId) {
            // Add a small delay to ensure wagmi is fully initialized
            const timer = setTimeout(() => {
                setHasInitialized(true)
            }, 1000)
            return () => clearTimeout(timer)
        } else {
            setHasInitialized(false)
        }
    }, [ready, authenticated, address, poolAddress, chainId])

    // Only make the contract call if we have all required data and are properly initialized
    const shouldQuery = Boolean(
        hasInitialized &&
            ready &&
            authenticated &&
            address &&
            poolAddress &&
            address !== '0x' &&
            chainId &&
            isConnected,
    )

    const {
        data: isAdmin,
        isLoading,
        error,
        isError,
    } = useReadContract({
        abi: [getAbiItem({ abi: poolAbi, name: 'hasRole' })],
        address: poolAddress,
        functionName: 'hasRole',
        args: [ROLES.ADMIN, address || '0x0000000000000000000000000000000000000000'],
        chainId,
        query: {
            enabled: shouldQuery,
            staleTime: 5 * 60 * 1000, // Cache for 5 minutes since admin status doesn't change frequently
            gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
            refetchInterval: false, // DISABLE automatic polling to prevent excessive RPC calls
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnMount: false, // Don't refetch if we have fresh data
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: (failureCount, error) => {
                // Don't retry on 403 Forbidden errors or rate limit errors
                if (
                    error?.message?.includes('403') ||
                    error?.message?.includes('Forbidden') ||
                    error?.message?.includes('429') ||
                    error?.message?.includes('rate limit')
                ) {
                    console.warn('[useIsAdmin] RPC endpoint returned error, not retrying:', error?.message)
                    return false
                }
                // Only retry up to 1 time for other errors
                return failureCount < 1
            },
            retryDelay: 2000, // Fixed 2 second delay
        },
    })

    // Log errors for debugging
    if (isError && error) {
        console.warn('[useIsAdmin] Contract read error:', {
            error: error.message,
            chainId,
            poolAddress,
            address,
            shouldQuery,
            hasInitialized,
            isConnected,
        })
    }

    // If we have an error, assume user is not admin for safety
    const finalIsAdmin = Boolean(isAdmin && !isError)

    return {
        isAdmin: finalIsAdmin,
        isLoading: (isLoading && shouldQuery) || (!hasInitialized && authenticated),
        error: isError ? error : null,
        chainId,
        // Additional debug info
        debug: {
            shouldQuery,
            hasAddress: Boolean(address),
            hasPoolAddress: Boolean(poolAddress),
            isAuthenticated: authenticated,
            isReady: ready,
            hasInitialized,
            isConnected,
        },
    }
}
