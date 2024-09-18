import { useQuery } from '@tanstack/react-query'
import { fetchClaimablePools } from './fetch-claimable-pools'
import { getConfig } from '@/app/_client/providers/configs/wagmi.config'

export const useClaimablePools = (address: string) => {
    const {
        data: rawClaimablePools,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['claimablePools', address, getConfig().state.chainId],
        queryFn: fetchClaimablePools,
    })

    const claimablePools = rawClaimablePools
        ? [
              rawClaimablePools[0].filter((_, index) => !rawClaimablePools[1][index]),
              rawClaimablePools[1].filter(claimed => !claimed),
          ]
        : undefined

    return { claimablePools, isLoading, error }
}
