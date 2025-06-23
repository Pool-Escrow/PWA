import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { useChainId } from 'wagmi'
import { useIsAdmin } from './use-is-admin'

/**
 * Hook that provides chain-aware user data
 * This ensures that user data updates when the user switches chains
 */
export function useUserData() {
    const { user, authenticated, ready } = usePrivy()
    const chainId = useChainId()
    const address = user?.wallet?.address as Address | undefined

    const { isAdmin, isLoading: isAdminLoading } = useIsAdmin()

    // User profile data that might be chain-specific
    const userProfileQuery = useQuery({
        queryKey: ['user-profile', address, chainId, isAdmin],
        queryFn: () => {
            if (!address) return null

            // Here you can fetch chain-specific user data
            // For example, user settings, preferences, or chain-specific data
            return {
                address,
                chainId,
                isAdmin: isAdmin ?? false,
                // Add other user data that might be chain-specific
            }
        },
        enabled: Boolean(address && authenticated && ready),
        staleTime: 300_000, // Consider data fresh for 5 minutes
        gcTime: 600_000, // Keep in cache for 10 minutes
    })

    return {
        user,
        address,
        chainId,
        authenticated,
        ready,
        isAdmin,
        isAdminLoading,
        userProfile: userProfileQuery.data,
        isUserProfileLoading: userProfileQuery.isLoading,
    }
}
