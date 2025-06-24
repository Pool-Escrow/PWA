import MainPageLoginButton from '@/components/main-page-login-button'
import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/components/pull-to-refresh'
import TopSection from '@/components/top-section'
import UpcomingPools from '@/features/pools/components/upcoming-pools'
import { getUpcomingPools } from '@/features/pools/server/get-upcoming-pools'
import { POOLS_UPCOMING_KEY } from '@/hooks/query-keys'
import RenderBottomBar from './_components/render-bottom-bar'

export default async function PoolsPage() {
    const upcomingPools = await getUpcomingPools()

    return (
        <PageWrapper>
            <div className='flex h-full flex-1 flex-col'>
                <TopSection topBarProps={{ backButton: false }} />
                <div className='relative flex-1 overflow-hidden'>
                    <PullToRefresh keysToRefetch={[POOLS_UPCOMING_KEY]}>
                        <div
                            className='absolute inset-0 overflow-y-auto overscroll-y-contain [&::-webkit-scrollbar]:hidden'
                            style={{
                                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                                WebkitOverflowScrolling: 'touch',
                            }}>
                            <div className='mt-4 space-y-4 px-1 pb-safe'>
                                {/* <NextUserPoolV2 /> */}
                                <UpcomingPools initialData={upcomingPools} />
                            </div>
                        </div>
                    </PullToRefresh>
                </div>
            </div>
            <MainPageLoginButton />
            <RenderBottomBar />
        </PageWrapper>
    )
}
