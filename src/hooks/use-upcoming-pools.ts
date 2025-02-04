import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { getContractPools } from '@/app/_server/persistence/pools/blockchain/get-contract-pools'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { transformContractPoolToUIPool } from '@/app/_lib/utils/pool-transforms'

const fetchUpcomingPools = async (): Promise<PoolItem[]> => {
    const supabase = getSupabaseBrowserClient()
    const contractPools = await getContractPools()
    const { data: dbPools } = await supabase.from('pools').select('*')

    return contractPools
        .filter(pool => pool.status <= POOLSTATUS.DEPOSIT_ENABLED)
        .map(contractPool => {
            const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
            return transformContractPoolToUIPool(contractPool, dbPool)
        })
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
}

export const useUpcomingPools = () => {
    return useQuery({
        queryKey: ['upcoming-pools'],
        queryFn: fetchUpcomingPools,
        refetchInterval: 30000,
        staleTime: 10000,
    })
}
