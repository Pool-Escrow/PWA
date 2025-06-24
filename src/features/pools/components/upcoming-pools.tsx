'use client'

import PoolList from '@/features/pools/components/pool-list'
import { useUpcomingPools } from '@/features/pools/hooks/use-upcoming-pools'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { ErrorBoundary } from 'react-error-boundary'
import UpcomingPoolsSkeleton from './upcoming-pools-skeleton'

function UpcomingPoolsError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    console.error('[UpcomingPools] Error boundary caught:', error)

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
            <div className='mt-4 flex items-center justify-center rounded-3xl bg-white p-8'>
                <div className='text-center'>
                    <h3 className='text-lg font-semibold text-gray-900'>Something went wrong</h3>
                    <p className='mt-2 text-sm text-gray-600'>{error.message || 'Failed to load upcoming pools'}</p>
                    <button
                        onClick={resetErrorBoundary}
                        className='mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'>
                        Try again
                    </button>
                </div>
            </div>
        </div>
    )
}

function UpcomingPoolsContent({ initialData }: { initialData: PoolsQueryResult }) {
    const { data, isLoading, isFetching, isError, error } = useUpcomingPools(initialData)

    if (isError) {
        console.error('[UpcomingPools] Query error:', error)
        return (
            <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                <div className='mt-4 flex items-center justify-center rounded-3xl bg-white p-8'>
                    <div className='text-center'>
                        <p className='text-sm text-gray-600'>Error loading pools: {error?.message}</p>
                        <p className='mt-2 text-xs text-gray-500'>Check console for details</p>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoading && !data?.pools) {
        console.log('[UpcomingPools] ⏳ Loading state')
        return (
            <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                <div className='mt-4'>
                    <UpcomingPoolsSkeleton length={8} />
                </div>
            </div>
        )
    }

    const pools = data?.pools || []
    const metadata = data?.metadata

    // Log successful render
    console.log('[UpcomingPools] ✅ Rendering with data:', {
        poolsCount: pools.length,
        metadata,
        isFetching,
        sampleData: pools.slice(0, 2),
    })

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <div className='flex items-center justify-between'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                {/* // TODO: control toggle with dev mode in settings page */}
                {process.env.NODE_ENV === 'development' && metadata && (
                    <div className='text-xs text-gray-500'>
                        {metadata.visiblePools}/{metadata.totalContractPools}
                    </div>
                )}
            </div>
            <div className='mt-4'>
                <PoolList pools={pools} name='feed' isLoading={isLoading || isFetching} />
            </div>
        </div>
    )
}

export default function UpcomingPools({ initialData }: { initialData: PoolsQueryResult }) {
    return (
        <ErrorBoundary
            FallbackComponent={UpcomingPoolsError}
            onError={(error, errorInfo) => {
                console.error('[UpcomingPools] Error boundary:', error, errorInfo)
            }}
            onReset={() => {
                // Optionally trigger a refetch or page reload
                console.log('[UpcomingPools] Error boundary reset')
            }}>
            <UpcomingPoolsContent initialData={initialData} />
        </ErrorBoundary>
    )
}

interface PoolsQueryResult {
    pools: PoolItem[]
    metadata: {
        totalContractPools: number
        totalDbPools: number
        visiblePools: number
        syncedPools: number
    }
}
