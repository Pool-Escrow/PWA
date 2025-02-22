import PageWrapper from '@/components/page-wrapper'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import { dehydrate, QueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'

// Importar un componente cliente que maneje la hidratación
const HydratedPoolDetails = dynamic(() => import('./hydrated-pool-details'), {
    ssr: true,
})

type Props = {
    params: Promise<{ 'pool-id': string }>
}

export default async function PoolDetailsPage({ params }: Props) {
    const queryClient = new QueryClient()
    const { 'pool-id': poolId } = await params

    await Promise.all([
        queryClient
            .prefetchQuery({
                queryKey: ['pool-details', poolId],
                queryFn: getPoolDetailsById,
            })
            .catch(error => {
                console.error('Error prefetching pool details:', error)
            }),

        queryClient
            .prefetchQuery({
                queryKey: ['userAdminStatus'],
                queryFn: getUserAdminStatusActionWithCookie,
            })
            .catch(error => {
                console.error('Error prefetching user admin status:', error)
            }),
    ])

    const dehydratedState = dehydrate(queryClient)

    return (
        <PageWrapper topBarProps={{ title: 'Pool Details', backButton: true }}>
            <HydratedPoolDetails state={dehydratedState} poolId={poolId} />
        </PageWrapper>
    )
}
