import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import PoolDetails from '@/features/pools/pages/pool-details'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'

type Props = {
    params: { 'pool-id': string }
}

export default async function PoolDetailsPage({ params: { 'pool-id': poolId } }: Props) {
    const queryClient = new QueryClient()

    queryClient.prefetchQuery({
        queryKey: ['pool-details', poolId],
        queryFn: getPoolDetailsById,
    })

    queryClient.prefetchQuery({
        queryKey: ['userAdminStatus'],
        queryFn: () => getUserAdminStatusActionWithCookie(),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PoolDetails poolId={poolId} />
        </HydrationBoundary>
    )
}
