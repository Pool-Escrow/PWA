import { getConfig } from '@/providers/configs/wagmi.config'
import { useQuery } from '@tanstack/react-query'
import { fetchPoolDetails } from './fetch-pool-details'

export const usePoolDetails = (poolId: string) => {
    const {
        data: poolDetails,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['poolDetails', poolId, getConfig().state.chainId],
        queryFn: fetchPoolDetails,
    })

    return { poolDetails, isLoading, error }
}
