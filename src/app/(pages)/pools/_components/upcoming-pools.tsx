'use client'

import PoolList from './pool-list'
import PoolsSkeleton from './pools-skeleton'
import { useUpcomingPools } from '@/hooks/use-upcoming-pools'

export default function UpcomingPools() {
    const { data: pools, isLoading, isError } = useUpcomingPools()

    if (isError) {
        return <div>Error loading upcoming pools</div>
    }

    return (
        <>
            <h1 className='mb-4 text-lg px-2 font-semibold'>Upcoming Pools</h1>
            {isLoading ? <PoolsSkeleton length={8} /> : <PoolList pools={pools} name='feed' />}
        </>
    )
}
