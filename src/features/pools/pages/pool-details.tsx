'use client'

import PoolDetailsBanner from '@/features/pools/components/pool-details/banner'
import PoolDetailsBannerButtons from '@/features/pools/components/pool-details/banner-buttons'
import PoolDetailsBannerStatus from '@/features/pools/components/pool-details/banner-status'
import PoolDetailsCard from '@/features/pools/components/pool-details/card'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { useQuery } from '@tanstack/react-query'

// import PoolDetailsLoader from '@/app/(pages)/pool/[pool-id]/loading'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

import BottomBarHandler from '@/app/(pages)/pool/[pool-id]/_components/bottom-bar-handler'
import PoolDetailsHeading from '@/app/(pages)/pool/[pool-id]/_components/pool-details-heading'
import PoolDetailsInfo from '@/app/(pages)/pool/[pool-id]/_components/pool-details-info'
import PoolDetailsParticipants from '@/app/(pages)/pool/[pool-id]/_components/pool-details-participants'
import PoolDetailsProgress from '@/app/(pages)/pool/[pool-id]/_components/pool-details-progress'
import PullToRefresh from '@/components/pull-to-refresh'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect } from 'react'

export default function PoolDetails({ poolId }: { poolId: string }) {
    const {
        data: pool,
        isPending: isPoolPending,
        isError: isPoolError,
    } = useQuery({
        queryKey: ['pool-details', poolId],
        queryFn: getPoolDetailsById,
    })

    const { isAdmin, isLoading: isUserInfoPending, error: isUserInfoError } = useIsAdmin()

    console.log('🔄 [PoolDetails] Rendering with poolId:', poolId)

    useEffect(() => {
        console.log('👀 [PoolDetails] Effect: Pool data changed', {
            isPoolPending,
            isUserInfoPending,
            hasPool: Boolean(pool),
            isAdmin,
        })
    }, [pool, isAdmin, isPoolPending, isUserInfoPending])
    console.log(pool, '<<POOL>>')
    if (isPoolPending || isUserInfoPending)
        return (
            <div className='flex flex-col space-y-3 bg-white p-2'>
                <div className='detail_card rounded-[2.875rem] p-[1.12rem]'>
                    <Skeleton className='detail_card_banner relative overflow-hidden' />
                    <div className='mb-[1.81rem] mt-[0.81rem] flex flex-col gap-[0.38rem]'>
                        <Skeleton className='h-12' />
                        <Skeleton className='h-8' />
                        <Skeleton className='h-4' />
                    </div>
                    <div className='detail_card rounded-[2.875rem] p-[1.12rem]'>
                        <Skeleton className='h-16 rounded-full' />
                    </div>
                </div>
                <div className='detail_card flex flex-1 rounded-[2.875rem] p-[1.12rem]'>
                    <div className='grow space-y-3 rounded-[2.875rem]'>
                        <div className='h-32 space-y-4'>
                            <Skeleton className='h-4 w-full border-b-[0.5px] pb-2 text-xs font-semibold' />
                            <Skeleton className='h-4 w-full border-b-[0.5px] pb-2 text-xs font-semibold' />
                            <Skeleton className='h-4 w-full border-b-[0.5px] pb-2 text-xs font-semibold' />
                        </div>
                    </div>
                </div>
            </div>
        )
    if (isPoolError || isUserInfoError) return <div>Error loading pool details</div>
    if (!pool) return <div>Pool not found</div>

    const avatarUrls = pool.participants.map(participant => ({
        url: participant.avatarUrl,
        address: participant.address,
    }))

    return (
        <PullToRefresh keysToRefetch={['pool-details', 'is-admin']}>
            <div
                className='h-full space-y-3 overflow-y-auto overscroll-y-contain bg-white p-2 overflow-scrolling-touch'
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
                <PoolDetailsCard>
                    <PoolDetailsBanner
                        name={pool.name}
                        imageUrl={pool.imageUrl || ''}
                        buttons={<PoolDetailsBannerButtons isAdmin={isAdmin} />}
                        status={<PoolDetailsBannerStatus status={pool.status} />}
                    />
                    <PoolDetailsHeading
                        status={pool.status}
                        name={pool.name}
                        startDate={pool.startDate}
                        endDate={pool.endDate}
                        hostName={pool.hostName || 'No host'}
                    />
                    {/* <PoolDetailsClaimableWinnings // <--- TANSTACK QUERY ERROR
                    claimableAmount={pool.claimableAmount}
                    tokenSymbol={pool.tokenSymbol}
                    poolId={pool.contractId}
                /> */}
                    <div className='space-y-3 rounded-[2rem] bg-[#F4F4F4] p-5 pb-4'>
                        {pool.status != Number(POOLSTATUS.ENDED) && (
                            <PoolDetailsProgress
                                data-testid='pool-details-progress'
                                current={pool.poolBalance}
                                goal={pool.goal}
                            />
                        )}
                        <PoolDetailsParticipants
                            poolId={pool.contractId}
                            numParticipants={pool.numParticipants}
                            avatarUrls={avatarUrls as { url?: string; address: `0x${string}` }[]}
                        />
                    </div>
                </PoolDetailsCard>
                <PoolDetailsCard className='space-y-6 py-6'>
                    <PoolDetailsInfo
                        description={pool.description || ''}
                        price={pool.price}
                        tokenSymbol={pool.tokenSymbol}
                        termsUrl={pool.termsUrl || ''}
                    />
                </PoolDetailsCard>

                <BottomBarHandler
                    keysToRefetch={['pool-details', 'is-admin']}
                    poolId={pool.contractId}
                    isAdmin={isAdmin || false}
                    poolStatus={pool.status}
                    poolPrice={pool.price}
                    poolTokenSymbol={pool.tokenSymbol}
                    tokenDecimals={pool.tokenDecimals}
                    requiredAcceptance={pool.requiredAcceptance || false}
                    termsUrl={pool.termsUrl || ''}
                    poolName={pool.name}
                />
            </div>
        </PullToRefresh>
    )
}
