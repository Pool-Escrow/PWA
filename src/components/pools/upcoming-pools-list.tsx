'use client'

import PoolList from '@/components/pools/pools-list'
import { useUpcomingPools } from '@/hooks/use-pools'
import PoolsSkeleton from '../ui/skeletons'

export default function UpcomingPoolsList() {
  const { data, isLoading, isError } = useUpcomingPools()

  if (isError) {
    return <div>Error loading upcoming pools</div>
  }

  return (
    <div className="detail_card_bg rounded-[2rem] p-3 pt-[18px]">
      <h1 className="pl-[6px] text-lg font-semibold">Upcoming Pools</h1>
      <div className="mt-4">
        {isLoading ? <PoolsSkeleton length={8} /> : <PoolList pools={data?.pools} name="upcoming" />}
      </div>
    </div>
  )
}
