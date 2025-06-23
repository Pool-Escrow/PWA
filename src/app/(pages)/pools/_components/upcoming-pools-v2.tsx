'use client'

import { useUpcomingPoolsWithDebug } from '@/hooks/use-upcoming-pools-v2'
import { ErrorBoundary } from 'react-error-boundary'
import PoolList from './pool-list'
import PoolsSkeleton from './pools-skeleton'

function UpcomingPoolsError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    console.error('[UpcomingPoolsV2] Error boundary caught:', error)

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

function UpcomingPoolsContent() {
    const { data, isLoading, isFetching, isError, error } = useUpcomingPoolsWithDebug()

    if (isError) {
        console.error('[UpcomingPoolsV2] Query error:', error)
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

    if (isLoading) {
        console.log('[UpcomingPoolsV2] ⏳ Loading state')
        return (
            <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                <div className='mt-4'>
                    <PoolsSkeleton length={8} />
                </div>
            </div>
        )
    }

    const pools = data?.pools || []
    const metadata = data?.metadata

    // Log successful render
    if (process.env.NODE_ENV === 'development') {
        console.log('[UpcomingPoolsV2] ✅ Rendering with data:', {
            poolsCount: pools.length,
            metadata,
            isFetching,
            sampleData: pools.slice(0, 2),
        })
    }

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <div className='flex items-center justify-between'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
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

export default function UpcomingPoolsV2() {
    return (
        <ErrorBoundary
            FallbackComponent={UpcomingPoolsError}
            onError={(error, errorInfo) => {
                console.error('[UpcomingPoolsV2] Error boundary:', error, errorInfo)
            }}
            onReset={() => {
                // Optionally trigger a refetch or page reload
                console.log('[UpcomingPoolsV2] Error boundary reset')
            }}>
            <UpcomingPoolsContent />
        </ErrorBoundary>
    )
}
