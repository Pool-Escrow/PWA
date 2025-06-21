'use client'

import PageWrapper from '@/components/page-wrapper'
import PoolDetails from '@/features/pools/pages/pool-details'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import * as React from 'react'

type Props = {
    params: { 'pool-id': string }
}

export default function PoolDetailsPage({ params: { 'pool-id': poolId } }: Props) {
    const queryClient = new QueryClient()

    queryClient.prefetchQuery({
        queryKey: ['pool-details', poolId],
        queryFn: getPoolDetailsById,
    })

    queryClient.prefetchQuery({
        queryKey: ['userAdminStatus'],
        queryFn: getUserAdminStatusActionWithCookie,
    })

    return (
        <PageWrapper topBarProps={{ title: 'Pool Details', backButton: true }}>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <PoolDetails poolId={poolId} />
            </HydrationBoundary>
        </PageWrapper>
    )
}
