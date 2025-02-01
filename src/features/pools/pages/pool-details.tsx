'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import PoolDetailsCard from '@/features/pools/components/pool-details/card'
import PoolDetailsBanner from '@/features/pools/components/pool-details/banner'
import PoolDetailsBannerStatus from '@/features/pools/components/pool-details/banner-status'
import PoolDetailsBannerButtons from '@/features/pools/components/pool-details/banner-buttons'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'

// import PoolDetailsLoader from '@/app/(pages)/pool/[pool-id]/loading'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

import PoolDetailsHeading from '@/app/(pages)/pool/[pool-id]/_components/pool-details-heading'
import PoolDetailsProgress from '@/app/(pages)/pool/[pool-id]/_components/pool-details-progress'
import PoolDetailsParticipants from '@/app/(pages)/pool/[pool-id]/_components/pool-details-participants'
import PoolDetailsInfo from '@/app/(pages)/pool/[pool-id]/_components/pool-details-info'
import BottomBarHandler from '@/app/(pages)/pool/[pool-id]/_components/bottom-bar-handler'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { useEffect } from 'react'
import PullToRefresh from '@/app/_components/pull-to-refresh'

export default function PoolDetails({ poolId }: { poolId: string }) {
    const queryClient = useQueryClient()

    const {
        data: pool,
        isPending: isPoolPending,
        isError: isPoolError,
    } = useQuery({
        queryKey: ['pool-details', poolId],
        queryFn: getPoolDetailsById,
    })

    const {
        data: isAdmin,
        isPending: isUserInfoPending,
        isError: isUserInfoError,
    } = useQuery({
        queryKey: ['userAdminStatus'],
        queryFn: () => getUserAdminStatusActionWithCookie(),
    })

    const handleRefresh = async () => {
        console.log('🔄 Refreshing pool details...')
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['pool-details', poolId] }),
            queryClient.invalidateQueries({ queryKey: ['userAdminStatus'] }),
        ])
        console.log('✅ Pool details refreshed')
    }

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
        <PullToRefresh onRefresh={handleRefresh}>
        <div className='space-y-3 bg-white p-2'>
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
                <div className='space-y-3 rounded-[2rem] bg-[#F4F4F4] p-5'>
                    {pool.status != POOLSTATUS.ENDED && (
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
                poolId={pool.contractId}
                isAdmin={isAdmin || false}
                poolStatus={pool.status}
                poolPrice={pool.price}
                poolTokenSymbol={pool.tokenSymbol}
                tokenDecimals={pool.tokenDecimals}
                requiredAcceptance={pool.requiredAcceptance || false}
                termsUrl={pool.termsUrl || ''}
            />
        </div>
        </PullToRefresh>
    )
}
