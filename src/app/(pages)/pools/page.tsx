import NextUserPool from './_components/next-user-pool'
import UpcomingPools from './_components/upcoming-pools'
import RenderBottomBar from './_components/render-bottom-bar'
import PageWrapper from '@/components/page-wrapper'
import PullToRefresh from '@/app/_components/pull-to-refresh'
import TopSection from '@/components/top-section'

export default function PoolsPage() {
    return (
        <PageWrapper>
            <div className='flex h-full flex-1 flex-col'>
                <TopSection topBarProps={{ backButton: false }} />
                <div className='relative flex-1 overflow-hidden'>
                    <PullToRefresh keysToRefetch={['pools', 'next-user-pool', 'upcoming-pools']}>
                        <div
                            className='absolute inset-0 overflow-y-auto overscroll-y-contain'
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
