import PageWrapper from '@/components/page-wrapper'
import { Suspense } from 'react'
import RenderBottomBar from '../pools/_components/render-bottom-bar'
import MyPools from './_components/my-pools'
import { getMyPoolsPageAction } from './actions'

// Mark explicitly as dynamic
export const dynamic = 'force-dynamic'

export default async function MyPoolsPage() {
    const { upcomingPools, pastPools } = await getMyPoolsPageAction()

    return (
        <PageWrapper topBarProps={{ backButton: true, title: 'My Pools' }}>
            <Suspense fallback={<div>Loading pools...</div>}>
                <MyPools initialUpcomingPools={upcomingPools} initialPastPools={pastPools} />
            </Suspense>
            <RenderBottomBar />
        </PageWrapper>
    )
}
