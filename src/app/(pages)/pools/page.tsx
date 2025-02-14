'use client'

import NextUserPool from './_components/next-user-pool'
import UpcomingPools from './_components/upcoming-pools'
import RenderBottomBar from './_components/render-bottom-bar'
import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/app/_components/pull-to-refresh'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import TopSection from '@/components/top-section'

export default function PoolsPage() {
    const queryClient = useQueryClient()

    const handleRefresh = useCallback(async () => {
        try {
            console.log('🔄 Refreshing pools data...')
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['pools'], exact: true }),
                queryClient.invalidateQueries({ queryKey: ['next-user-pool'], exact: true }),
                queryClient.invalidateQueries({ queryKey: ['upcoming-pools'], exact: true }),
            ])
            console.log('✅ Pools data refreshed')
        } catch (error) {
            console.error('Failed to refresh pools:', error)
        }
    }, [queryClient])

    return (
        <PageWrapper>
            <div className='flex h-full flex-1 flex-col'>
                <TopSection topBarProps={{ backButton: false }} />
                <div className='relative flex-1 overflow-hidden'>
                    <PullToRefresh onRefresh={handleRefresh}>
                        <div
                            className='-webkit-overflow-scrolling-touch absolute inset-0 overflow-y-auto overscroll-y-contain'
                            style={{
                                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                                WebkitOverflowScrolling: 'touch',
                            }}>
                            {/* Hide scrollbar in Chrome/Safari/Webkit */}
                            <style jsx>{`
                                div::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            <div className='mt-4 space-y-4 pb-safe'>
                                <NextUserPool />
                                <UpcomingPools />
                            </div>
                        </div>
                    </PullToRefresh>
                </div>
            </div>
            <RenderBottomBar />
        </PageWrapper>
    )
}
