import { useQuery } from '@tanstack/react-query'
import { fetchPoolDetails } from './fetch-pool-details'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'

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
