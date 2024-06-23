import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchPoolDetails } from '../contracts/fetch-pool-details'

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
