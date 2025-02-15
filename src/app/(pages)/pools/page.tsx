import NextUserPool from './_components/next-user-pool'
import UpcomingPools from './_components/upcoming-pools'
import RenderBottomBar from './_components/render-bottom-bar'
import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/app/_components/pull-to-refresh'
import TopSection from '@/components/top-section'
import MainPageLoginButton from '@/components/main-page-login-button'

export default function PoolsPage() {
    return (
        <PageWrapper>
            <div className='flex h-full flex-1 flex-col'>
                <TopSection topBarProps={{ backButton: false }} />
                <div className='relative flex-1 overflow-hidden'>
                    <PullToRefresh keysToRefetch={['pools', 'next-user-pool', 'upcoming-pools']}>
                        <div
                            className='absolute inset-0 overflow-y-auto overscroll-y-contain [&::-webkit-scrollbar]:hidden'
                            style={{
                                msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
                                scrollbarWidth: 'none', // Hide scrollbar in Firefox
                                WebkitOverflowScrolling: 'touch',
                            }}>
                            <div className='mt-4 space-y-4 px-1 pb-safe'>
                                <NextUserPool />
                                <UpcomingPools />
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
