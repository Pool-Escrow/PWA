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
        <div className={'detail_card rounded-[2rem] bg-[#F6F6F6] p-3 pt-[18px]'}>
            <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
            <div className='mt-4'>
                {isLoading ? <PoolsSkeleton length={8} /> : <PoolList pools={pools} name='feed' />}
            </div>
        </div>
    )
}
