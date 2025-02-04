import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { Address } from 'viem'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { getUserPools } from '@/app/_server/persistence/pools/blockchain/get-contract-user-pools'
import { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { transformContractPoolToUIPool } from '@/app/_lib/utils/pool-transforms'

const fetchUserNextPool = async (userAddress: Address): Promise<PoolItem | null> => {
    const supabase = getSupabaseBrowserClient()
    const userPools = await getUserPools(userAddress)
    const { data: dbPools } = await supabase.from('pools').select('*')

    const validPools = userPools
        .filter(pool => pool.status <= POOLSTATUS.DEPOSIT_ENABLED)
        .map(contractPool => {
            const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
            return transformContractPoolToUIPool(contractPool, dbPool)
        })
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

    return validPools[0] || null
}

export const useUserNextPool = () => {
    const { user } = usePrivy()
    const userAddress = user?.wallet?.address as Address | undefined

    return useQuery({
        queryKey: ['user-next-pool', userAddress],
        queryFn: () => fetchUserNextPool(userAddress!),
        enabled: Boolean(userAddress),
        select: data => data || undefined,
    })
}
