'use client'

import { Button } from '@/components/ui/button'
import PoolList from '@/features/pools/components/pool-list'
import { useUpcomingPools } from '@/features/pools/hooks/use-upcoming-pools'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { useDeveloperStore } from '@/stores/developer.store'
import { ErrorBoundary } from 'react-error-boundary'
import UpcomingPoolsSkeleton from './upcoming-pools-skeleton'

interface PoolsQueryResult {
    pools: PoolItem[]
    metadata: {
        totalContractPools: number
        totalDbPools: number
        visiblePools: number
        syncedPools: number
        fetchTime: number
        cacheStatus: 'hit' | 'miss'
    }
}

function UpcomingPoolsError({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    console.error('[UpcomingPools] Error boundary caught:', error)

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
            <div className='mt-4 flex items-center justify-center rounded-3xl bg-white p-8'>
                <div className='text-center'>
                    <h3 className='text-lg font-semibold text-gray-900'>Something went wrong</h3>
                    <p className='mt-2 text-sm text-gray-600'>{error.message || 'Failed to load upcoming pools'}</p>
                    <Button onClick={resetErrorBoundary} variant='outline' size='sm' className='mt-4'>
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    )
}

function UpcomingPoolsContent({ initialData }: { initialData?: PoolsQueryResult }) {
    const { data, isLoading, isFetching, isError, error, hasData, metadata, refresh } = useUpcomingPools(initialData)
    const { settings } = useDeveloperStore()

    // Error state with retry capability
    if (isError) {
        console.error('[UpcomingPools] Query error:', error)
        return (
            <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                <div className='mt-4 flex items-center justify-center rounded-3xl bg-white p-8'>
                    <div className='text-center'>
                        <p className='text-sm text-gray-600'>{error?.message || 'Error loading pools'}</p>
                        <Button onClick={() => void refresh()} variant='outline' size='sm' className='mt-3'>
                            Retry
                        </Button>
                        {process.env.NODE_ENV === 'development' && (
                            <p className='mt-2 text-xs text-gray-500'>Check console for details</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Loading state with optimized skeleton
    if (isLoading && !hasData) {
        return (
            <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
                <h1 className='pl-[6px] text-lg font-semibold'>Upcoming Pools</h1>
                <div className='mt-4'>
                    <UpcomingPoolsSkeleton length={6} />
                </div>
            </div>
        )
    }

    const pools = data?.pools || []

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <div className='flex items-center justify-between'>
                <h1 className='pl-[6px] text-lg font-semibold'>
                    Upcoming Pools
                    {isFetching && !isLoading && <span className='ml-2 text-xs text-gray-500'>Updating...</span>}
                </h1>

                {/* Development metadata display */}
                {settings.isEnabled && metadata && (
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <span>
                            {metadata.visiblePools}/{metadata.totalContractPools}
                        </span>
                        {metadata.fetchTime > 500 && <span className='text-orange-500'>{metadata.fetchTime}ms</span>}
                        {metadata.cacheStatus === 'hit' && <span className='text-green-500'>cached</span>}
                    </div>
                )}
            </div>

            <div className='mt-4'>
                <PoolList pools={pools} name='feed' isLoading={isLoading || isFetching} />
            </div>
        </div>
    )
}

/**
 * Optimized UpcomingPools component with:
 * - Error boundaries for robust error handling
 * - Performance optimizations with React Query
 * - Development debugging features
 * - Proper loading states and error recovery
 */
export default function UpcomingPools({ initialData }: { initialData?: PoolsQueryResult }) {
    return (
        <ErrorBoundary
            FallbackComponent={UpcomingPoolsError}
            onError={(error, errorInfo) => {
                console.error('[UpcomingPools] Error boundary:', error, errorInfo)

                // Report to monitoring service in production
                if (process.env.NODE_ENV === 'production') {
                    // TODO: Add error reporting service
                    // errorReporting.captureException(error, { extra: errorInfo })
                }
            }}
            onReset={() => {
                // Optionally trigger a refetch or page reload
                console.log('[UpcomingPools] Error boundary reset')
                // Could trigger a full page refresh in extreme cases
                // window.location.reload()
            }}>
            <UpcomingPoolsContent initialData={initialData} />
        </ErrorBoundary>
    )
}
