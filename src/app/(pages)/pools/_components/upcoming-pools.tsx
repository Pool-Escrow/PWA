'use client'

import { useUpcomingPools } from '@/hooks/use-upcoming-pools'
import PoolList from './pool-list'
import PoolsSkeleton from './pools-skeleton'

export default function UpcomingPools() {
    const { data: pools, isLoading, isFetching, isError } = useUpcomingPools()

    if (isError) {
        return <div>Error loading upcoming pools</div>
    }

    if (isLoading) {
        return (
            <div className={'detail_card_bg rounded-[2rem] p-3 pt-[18px]'}>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                <div className='mt-4'>
                    <PoolsSkeleton length={8} />
                </div>
            </div>
        )
    }

    return (
        <div className={'detail_card_bg rounded-[2rem] p-3 pt-[18px]'}>
            <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
            <div className='mt-4'>
                <PoolList pools={pools} name='feed' isLoading={isLoading || isFetching} />
            </div>
        </div>
    )
}
