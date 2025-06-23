import { useUserInfo } from '@/hooks/use-user-info'
import { currentPoolAddress } from '@/server/blockchain/server-config'
import { poolAbi } from '@/types/contracts'
import { getAbiItem } from 'viem'
import { useReadContract } from 'wagmi'

export function useUserPoolRegistration(poolId: string) {
    const { data: user } = useUserInfo()
    const address = user?.address

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
            enabled: Boolean(address && poolId),
            refetchInterval: 30_000, // Check every 30 seconds
            staleTime: 20_000, // Consider data fresh for 20 seconds
        },
    })

    return {
        isRegistered: Boolean(isParticipant),
        isLoading,
        error,
        userAddress: address,
    }
}
