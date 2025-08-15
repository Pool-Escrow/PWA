'use client'

import PoolList from '@/components/pools/pools-list'
import { useUpcomingPools } from '@/hooks/use-pools'
import PoolsSkeleton from '../ui/skeletons'

export default function UpcomingPoolsList() {
  const { data, isLoading, isError } = useUpcomingPools()

  return (
    <div className="detail_card_bg rounded-[2rem] p-3 pt-[18px]">
      <h1 className="pl-[6px] text-lg font-semibold">Upcoming Pools</h1>
      <div className="mt-4">
        {isLoading ? (
          <PoolsSkeleton length={8} />
        ) : isError ? (
          <div className="flex h-24 items-center justify-center rounded-3xl bg-white p-4">
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-sm font-semibold">Unable to load pools</h2>
              <p className="text-xs text-gray-600">Please try again later</p>
            </div>
          </div>
        ) : (
          <PoolList pools={data?.pools ?? []} name="feed" />
        )}
      </div>
    </div>
  )
}
