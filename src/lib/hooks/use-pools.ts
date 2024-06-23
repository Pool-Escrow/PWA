import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchPools } from '../contracts/fetch-pools'

export const usePools = () => {
    const {
        data: pools,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['pools', wagmi.config.state.chainId],
        queryFn: fetchPools,
    })

    return { pools, isLoading, error }
}
