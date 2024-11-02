import Balance from '@/app/_components/balance/balance'
import NextUserPool from './_components/next-user-pool'
import UpcomingPools from './_components/upcoming-pools'
import RenderBottomBar from './_components/render-bottom-bar'
import PageWrapper from '@/components/page-wrapper'

export default async function PoolsPage() {
    return (
        <PageWrapper
            topBarProps={{
                backButton: false,
            }}>
            <div className='flex flex-1 flex-col space-y-6'>
                <Balance />
                <NextUserPool />
                <UpcomingPools />
            </div>
            <RenderBottomBar />
        </PageWrapper>
    )
}
