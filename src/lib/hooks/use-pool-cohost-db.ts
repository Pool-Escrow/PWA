import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchPoolParticipantsFromDB } from '../database/fetch-pool-participants-db'

export const usePoolCohostDB = (poolId: bigint) => {
    const {
        data: poolCohostDB,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['poolCohostDB', poolId, wagmi.config.state.chainId],
        queryFn: fetchPoolParticipantsFromDB,
    })

    return { poolCohostDB, isLoading, error }
}
