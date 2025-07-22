import { useUserInfo } from '@/hooks/use-user-info'
import { currentPoolAddress } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getAbiItem } from 'viem'
import { useReadContract } from 'wagmi'

export function useUserPoolRegistration(poolId: string) {
    const { data: user } = useUserInfo()
    const address = user?.address

    // Only proceed with query if we have valid prerequisites
    const canFetchRegistration = Boolean(address && poolId && address !== '0x')

    // Debug log for registration check - only when we actually make the request
    if (process.env.NODE_ENV === 'development' && canFetchRegistration) {
        console.log('[DEBUG][useUserPoolRegistration] useReadContract isParticipant', {
            address,
            poolId,
            poolAddress: currentPoolAddress,
            stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
            timestamp: new Date().toISOString(),
        })
    }

    const {
        data: isParticipant,
        isLoading,
        error,
    } = useReadContract({
        abi: [getAbiItem({ abi: poolAbi, name: 'isParticipant' })],
        address: currentPoolAddress,
        functionName: 'isParticipant',
        args: [address || '0x', BigInt(poolId)],
        query: {
            enabled: canFetchRegistration,
            staleTime: 60_000, // Consider data fresh for 1 minute
            gcTime: 300_000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false, // ✅ DISABLED automatic polling to prevent excessive requests
            retry: (failureCount, error) => {
                // Don't retry on 403 Forbidden errors or rate limit errors
                if (
                    error?.message?.includes('403') ||
                    error?.message?.includes('Forbidden') ||
                    error?.message?.includes('429') ||
                    error?.message?.includes('rate limit')
                ) {
                    return false
                }
                return failureCount < 1
            },
        },
    })

    return {
        isRegistered: Boolean(isParticipant),
        isLoading,
        error,
        userAddress: address,
    }
}
