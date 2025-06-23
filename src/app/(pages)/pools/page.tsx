import MainPageLoginButton from '@/components/main-page-login-button'
import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/components/pull-to-refresh'
import TopSection from '@/components/top-section'
import NextUserPoolV2 from './_components/next-user-pool-v2'
import RenderBottomBar from './_components/render-bottom-bar'
import UpcomingPoolsV2 from './_components/upcoming-pools-v2'

export default function PoolsPage() {
    return (
        <PageWrapper>
            <div className='flex h-full flex-1 flex-col'>
                <TopSection topBarProps={{ backButton: false }} />
                <div className='relative flex-1 overflow-hidden'>
                    <PullToRefresh
                        keysToRefetch={['pools', 'next-user-pool', 'upcoming-pools-v2', 'user-next-pools-v2']}>
                        <div
                            className='absolute inset-0 overflow-y-auto overscroll-y-contain [&::-webkit-scrollbar]:hidden'
                            style={{
                                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                                WebkitOverflowScrolling: 'touch',
                            }}>
                            <div className='mt-4 space-y-4 px-1 pb-safe'>
                                <NextUserPoolV2 />
                                <UpcomingPoolsV2 />
                                <div className='h-20' />
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
