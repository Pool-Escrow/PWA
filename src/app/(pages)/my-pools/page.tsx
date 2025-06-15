import PageWrapper from '@/components/page-wrapper'
import RenderBottomBar from '../pools/_components/render-bottom-bar'
import MyPools from './_components/my-pools'
import { getMyPoolsPageAction } from './actions'

// Force dynamic rendering since this page uses authentication and cookies
export const dynamic = 'force-dynamic'

export default async function MyPoolsPage() {
    const { upcomingPools, pastPools } = await getMyPoolsPageAction()

    return (
        <PageWrapper topBarProps={{ backButton: true, title: 'My Pools' }}>
            <MyPools initialUpcomingPools={upcomingPools} initialPastPools={pastPools} />
            <RenderBottomBar />
        </PageWrapper>
    )
}
