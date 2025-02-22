'use client'

import PoolDetails from '@/features/pools/pages/pool-details'
import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query'

type Props = {
    state: DehydratedState
    poolId: string
}

export default function HydratedPoolDetails({ state, poolId }: Props) {
    return (
        <HydrationBoundary state={state}>
            <PoolDetails poolId={poolId} />
        </HydrationBoundary>
    )
}
