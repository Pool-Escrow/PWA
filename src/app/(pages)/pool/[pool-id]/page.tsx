import PageWrapper from '@/components/page-wrapper'
import PoolDetails from '@/features/pools/pages/pool-details'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { useDeveloperStore } from '@/stores/developer.store'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

type Props = {
    params: { 'pool-id': string }
}

export default async function PoolDetailsPage({ params: { 'pool-id': poolId } }: Props) {
    const queryClient = new QueryClient()
    const { settings } = useDeveloperStore.getState()

    await queryClient.prefetchQuery({
        queryKey: ['pool-details', poolId, settings.defaultChainId],
        queryFn: () => getPoolDetailsById({ queryKey: ['pool-details', poolId], chainId: settings.defaultChainId }),
    })

    return (
        <PageWrapper topBarProps={{ title: 'Pool Details', backButton: true }}>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <PoolDetails poolId={poolId} />
            </HydrationBoundary>
        </PageWrapper>
    )
}
