import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchClaimablePools } from '../contracts/fetch-claimable-pools'

export const useClaimablePools = (address: string) => {
    const {
        data: claimablePools,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['claimablePools', address, wagmi.config.state.chainId],
        queryFn: fetchClaimablePools,
    })

    return { claimablePools, isLoading, error }
}
