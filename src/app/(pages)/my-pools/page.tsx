import MyPools from './_components/my-pools'
import { getMyPoolsPageAction } from './actions'
import RenderBottomBar from '../pools/_components/render-bottom-bar'
import PageWrapper from '@/components/page-wrapper'

export default async function MyPoolsPage() {
    const { upcomingPools, pastPools } = await getMyPoolsPageAction()
    return (
        <PageWrapper topBarProps={{ backButton: true, title: 'My Pools' }}>
            <MyPools initialUpcomingPools={upcomingPools} initialPastPools={pastPools} />
            <RenderBottomBar />
        </PageWrapper>
    )
}
