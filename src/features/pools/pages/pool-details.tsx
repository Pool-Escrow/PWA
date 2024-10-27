'use client'

import { useQuery } from '@tanstack/react-query'
import PoolDetailsCard from '@/features/pools/components/pool-details/card'
import PoolDetailsBanner from '@/features/pools/components/pool-details/banner'
import PoolDetailsBannerButtons from '@/features/pools/components/pool-details/banner-buttons'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'

import PoolDetailsLoader from '@/app/(pages)/pool/[pool-id]/loading'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'

import PoolDetailsHeading from '@/app/(pages)/pool/[pool-id]/_components/pool-details-heading'
import PoolDetailsProgress from '@/app/(pages)/pool/[pool-id]/_components/pool-details-progress'
import PoolDetailsParticipants from '@/app/(pages)/pool/[pool-id]/_components/pool-details-participants'
import PoolDetailsInfo from '@/app/(pages)/pool/[pool-id]/_components/pool-details-info'
import BottomBarHandler from '@/app/(pages)/pool/[pool-id]/_components/bottom-bar-handler'

export default function PoolDetails({ poolId }: { poolId: string }) {
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

    if (isPoolPending || isUserInfoPending) return <PoolDetailsLoader />
    if (isPoolError || isUserInfoError) return <div>Error loading pool details</div>
    if (!pool) return <div>Pool not found</div>

    const avatarUrls = pool.participants.map(participant => participant.avatarUrl)

    return (
        <div className='space-y-3 bg-white p-2'>
            <PoolDetailsCard>
                <PoolDetailsBanner
                    name={pool.name}
                    imageUrl={pool.imageUrl}
                    buttons={<PoolDetailsBannerButtons isAdmin={isAdmin} />}
                    // status={<PoolDetailsBannerStatus />}
                />
                <PoolDetailsHeading
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
                        avatarUrls={avatarUrls}
                    />
                </div>
            </PoolDetailsCard>
            <PoolDetailsCard className='space-y-6 py-6'>
                <PoolDetailsInfo
                    description={pool.description}
                    price={pool.price}
                    tokenSymbol={pool.tokenSymbol}
                    termsUrl={pool.termsUrl || ''}
                />
            </PoolDetailsCard>

            <BottomBarHandler
                poolId={BigInt(pool.contractId)}
                isAdmin={isAdmin}
                poolStatus={pool.status}
                poolPrice={pool.price}
                poolTokenSymbol={pool.tokenSymbol}
                tokenDecimals={pool.tokenDecimals}
                requiredAcceptance={pool.requiredAcceptance}
                termsUrl={pool.termsUrl || ''}
            />
        </div>
    )
}
