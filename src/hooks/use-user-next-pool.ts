import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { transformContractPoolToUIPool } from '@/lib/utils/pool-transforms'
import { getUserPools } from '@/server/persistence/pools/blockchain/get-contract-user-pools'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'

const fetchUserNextPool = async (userAddress: Address): Promise<PoolItem[] | null> => {
    const supabase = getSupabaseBrowserClient()
    const userPools = await getUserPools(userAddress)
    const { data: dbPools } = await supabase.from('pools').select('*')

    const validPools = userPools
        .filter(pool => pool.status <= Number(POOLSTATUS.DEPOSIT_ENABLED))
        .map(contractPool => {
            const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
            return transformContractPoolToUIPool(contractPool, dbPool)
        })
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
    return validPools?.slice(0, 3) || null
}

export const useUserNextPool = () => {
    const { user } = usePrivy()
    const userAddress = user?.wallet?.address as Address | undefined

    return useQuery({
        queryKey: ['user-next-pool', userAddress],
        queryFn: () => fetchUserNextPool(userAddress!),
        enabled: Boolean(userAddress),
        select: data => data || undefined,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        gcTime: 1000 * 60 * 10, // Garbage collect after 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnMount: false, // Prevent refetch on component mount if data exists
    })
}
