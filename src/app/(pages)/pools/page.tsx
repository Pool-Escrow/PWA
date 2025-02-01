'use client'

import Balance from '@/app/_components/balance/balance'
import NextUserPool from './_components/next-user-pool'
import UpcomingPools from './_components/upcoming-pools'
import RenderBottomBar from './_components/render-bottom-bar'
import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/app/_components/pull-to-refresh'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

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
        <PageWrapper
            topBarProps={{
                backButton: false,
            }}>
            <PullToRefresh onRefresh={handleRefresh}>
                <div className='flex flex-1 flex-col space-y-6'>
                    <Balance />
                    <NextUserPool />
                    <UpcomingPools />
                </div>
            </PullToRefresh>
            <RenderBottomBar />
        </PageWrapper>
    )
}
