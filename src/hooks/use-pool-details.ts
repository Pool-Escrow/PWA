import { fetchPoolDetails } from '@/lib/contracts/fetch-pool-details'
import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'

export const usePoolDetails = (poolId: bigint) => {
    const {
        data: poolDetails,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['pools', poolId, wagmi.config.state.chainId],
        queryFn: fetchPoolDetails,
    })

    return { poolDetails, isLoading, error }
}
