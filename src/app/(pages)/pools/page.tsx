import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/components/pull-to-refresh'
import { POOLS_UPCOMING_KEY } from '@/hooks/query-keys'
import { Suspense } from 'react'

/**
 * Optimized Pools Page with Subgraph Integration
 *
 * Performance improvements:
 * - ✅ Parallel data fetching for upcoming pools and user authentication
 * - ✅ Graceful error handling with fallbacks
 * - ✅ Optimized bundle splitting with Suspense boundaries
 * - ✅ Better cache invalidation strategy
 * - ✅ Shared balance hooks to prevent duplicate requests
 * - ✅ Debug overlay for monitoring requests in developer mode
 * - 🆕 SUBGRAPH INTEGRATION: Replaces 50+ onchain calls with 2-3 GraphQL queries
 */
export default function PoolsPage() {
    // console.log('[PoolsPage] 🚀 Starting page load with SUBGRAPH integration...')

    // // Parallel data fetching for optimal performance
    // const [upcomingPoolsResult, userResult] = await Promise.allSettled([
    //     getUpcomingPoolsFromSubgraph().catch((error: Error) => {
    //         console.error('[PoolsPage] Failed to fetch upcoming pools from subgraph:', error.message)
    //         // Return empty fallback instead of throwing
    //         return {
    //             pools: [],
    //             metadata: {
    //                 totalContractPools: 0,
    //                 totalDbPools: 0,
    //                 visiblePools: 0,
    //                 syncedPools: 0,
    //                 fetchTime: 0,
    //                 cacheStatus: 'miss' as const,
    //             },
    //         }
    //     }),
    //     verifyToken().catch(() => null), // Silent fail for authentication
    // ])

    // // Extract results with proper error handling
    // const upcomingPools =
    //     upcomingPoolsResult.status === 'fulfilled'
    //         ? upcomingPoolsResult.value
    //         : {
    //               pools: [],
    //               metadata: {
    //                   totalContractPools: 0,
    //                   totalDbPools: 0,
    //                   visiblePools: 0,
    //                   syncedPools: 0,
    //                   fetchTime: 0,
    //                   cacheStatus: 'miss' as const,
    //               },
    //           }

    // const user = userResult.status === 'fulfilled' ? userResult.value : null
    // const userAddress = user?.wallet?.address as Address | undefined

    // // Fetch user pools using subgraph (much faster than onchain calls)
    // let userPools: Awaited<ReturnType<typeof getUserPoolsFromSubgraph>> = []
    // if (userAddress) {
    //     try {
    //         console.log('[PoolsPage] 📊 Fetching user pools from SUBGRAPH...')
    //         userPools = await getUserPoolsFromSubgraph(userAddress, 'upcoming')
    //         console.log(`[PoolsPage] ✅ Got ${userPools.length} user pools from subgraph`)
    //     } catch (error) {
    //         console.error('[PoolsPage] Failed to fetch user pools from subgraph:', error)
    //         // Continue with empty user pools rather than crashing
    //         userPools = []
    //     }
    // }

    // console.log('[PoolsPage] 🎯 Page data loaded successfully:', {
    //     upcomingPoolsCount: upcomingPools.pools.length,
    //     userPoolsCount: userPools.length,
    //     fetchTime: upcomingPools.metadata.fetchTime,
    //     cacheStatus: upcomingPools.metadata.cacheStatus,
    // })

    return (
        <PageWrapper>
            <div className='flex h-full flex-1 flex-col'>
                {/* <TopSection topBarProps={{ backButton: false }} /> */}
                <div className='relative flex-1 overflow-hidden'>
                    <PullToRefresh keysToRefetch={[POOLS_UPCOMING_KEY]}>
                        <div
                            className='absolute inset-0 overflow-y-auto overscroll-y-contain [&::-webkit-scrollbar]:hidden'
                            style={{
                                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                                WebkitOverflowScrolling: 'touch',
                            }}>
                            <div className='mb-32 mt-4 space-y-4 px-1 pb-safe'>
                                {/* User Pools Section with Suspense boundary */}
                                <Suspense fallback={<div className='h-32 animate-pulse rounded-3xl bg-gray-200' />}>
                                    {/* <UserPools initialData={userPools} /> */}
                                </Suspense>

                                {/* Upcoming Pools Section with Suspense boundary */}
                                <Suspense fallback={<div className='h-64 animate-pulse rounded-3xl bg-gray-200' />}>
                                    {/* <UpcomingPools initialData={upcomingPools} /> */}
                                </Suspense>
                            </div>
                        </div>
                    </PullToRefresh>
                </div>
            </div>
            {/* <MainPageLoginButton /> */}
            {/* <RenderBottomBar /> */}
        </PageWrapper>
    )
}

/**
 * Dynamic page generation with ISR (Incremental Static Regeneration)
 * Regenerate the page every 30 seconds for fresh pool data
 */
export const revalidate = 30
