import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchPoolDetailsFromDB } from '../database/fetch-pool-details-db'

export const usePoolDetailsDB = (poolId: bigint) => {
    const {
        data: poolDetailsDB,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['poolDetailsDB', poolId, wagmi.config.state.chainId],
        queryFn: fetchPoolDetailsFromDB,
    })

    console.log('poolDetailsDB', poolDetailsDB)
    return { poolDetailsDB, isLoading, error }
}
