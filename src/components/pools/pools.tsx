// src/components/pools/pools.tsx

import PoolList from '@/components/pools/pool-list/pool-list'
import { fetchPools } from '@/lib/contracts/fetch-pools'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

export default async function PoolsPage() {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['pools'],
        queryFn: fetchPools,
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PoolList />
        </HydrationBoundary>
    )
}
