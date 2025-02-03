import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { getContractPools } from '@/app/_server/persistence/pools/blockchain/get-contract-pools'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

const fetchUpcomingPools = async (): Promise<PoolItem[]> => {
    const supabase = getSupabaseBrowserClient()

    // Fetch pools from the smart contract
    const contractPools = await getContractPools()

    console.log('contract pools length:', contractPools.length)

    // Fetch pool data from Supabase
    const { data: dbPools } = await supabase.from('pools').select('*')

    console.log('db pools length', dbPools?.length)

    const upcomingPools = contractPools
        .map(contractPool => {
            const dbPool = dbPools?.find(dp => dp.contract_id === parseInt(contractPool.id))
            if (!dbPool) return null

            // Convert status to number if it's a string
            const status = typeof contractPool.status === 'string' ? parseInt(contractPool.status) : contractPool.status

            // Include INACTIVE (0) and DEPOSIT_ENABLED (1) pools, filter out STARTED (2) and ENDED (3) pools
            if (status > 1) return null

            return {
                id: contractPool.id.toString(),
                name: contractPool.name,
                image: dbPool.bannerImage ?? '',
                startDate: new Date(Number(contractPool.timeStart) * 1000),
                endDate: new Date(Number(contractPool.timeEnd) * 1000),
                status: status as POOLSTATUS,
                numParticipants: Number(contractPool.numParticipants),
                softCap: dbPool.softCap,
            }
        })
        .filter((pool) => pool !== null)
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

    console.log('upcoming pools', upcomingPools)

    return upcomingPools as PoolItem[]
}

export const useUpcomingPools = () => {
    return useQuery({
        queryKey: ['upcoming-pools'],
        queryFn: fetchUpcomingPools,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    })
}
