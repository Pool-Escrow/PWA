import type { PoolDetailsDTO } from '../_lib/definitions'
import { POOLSTATUS } from '../_lib/definitions'
import PoolDetailsHeading from './pool-details-heading'
import PoolDetailsClaimableWinnings from './pool-details-claimable-winnings'
import PoolDetailsProgress from './pool-details-progress'
import PoolDetailsParticipants from './pool-details-participants'
import PoolDetailsBanner from './pool-details-banner'
import PoolDetailsBannerButtons from './pool-details-banner-button'
import PoolDetailsBannerStatus from './pool-details-banner-status'
import PoolDetailsInfo from './pool-details-info'
import { checkAuthStatusAction } from '../../../pools/actions'
import BottomBarHandler from './bottom-bar-handler'

export default async function PoolDetails({ pool }: { pool: PoolDetailsDTO }) {
    const poolBalance = pool.numParticipants * pool.price
    const avatarUrls = pool.participants.map(participant => participant.avatarUrl)
    const [result] = await checkAuthStatusAction()
    const isAdmin = (result && 'isAdmin' in result && result.isAdmin) || false
    const walletAddress = result && 'address' in result ? result.address : null

    console.log('pool', { poolBalance, avatarUrls, result, isAdmin, walletAddress })

    return (
        <div className='space-y-3 bg-white p-2'>
            <section className='detail_card rounded-[2.875rem] p-[1.12rem]'>
                <PoolDetailsBanner
                    name={pool.name}
                    imageUrl={pool.imageUrl}
                    buttons={<PoolDetailsBannerButtons isAdmin={isAdmin} />}
                    status={<PoolDetailsBannerStatus />}
                />
                <PoolDetailsHeading
                    name={pool.name}
                    startDate={pool.startDate}
                    endDate={pool.endDate}
                    hostName={pool.hostName}
                />
                <PoolDetailsClaimableWinnings
                    claimableAmount={pool.claimableAmount}
                    tokenSymbol={pool.tokenSymbol}
                    poolId={pool.contractId}
                />

                <div className='space-y-3 rounded-[2rem] bg-[#F4F4F4] p-5'>
                    {pool.status != POOLSTATUS.ENDED && (
                        <PoolDetailsProgress
                            data-testid='pool-details-progress'
                            current={pool.poolBalance}
                            goal={pool.goal}
                        />
                    )}
                    <PoolDetailsParticipants
                        poolId={pool.contractId.toString()}
                        numParticipants={pool.numParticipants}
                        avatarUrls={avatarUrls}
                    />
                </div>
            </section>

            <section className='detail_card space-y-6 rounded-[2.875rem] px-[1.12rem] py-6'>
                <PoolDetailsInfo
                    description={pool.description}
                    price={pool.price}
                    tokenSymbol={pool.tokenSymbol}
                    termsUrl={pool.termsUrl || ''}
                />
            </section>
            <BottomBarHandler
                poolId={pool.contractId}
                isAdmin={isAdmin}
                poolStatus={pool.status}
                poolPrice={pool.price}
                poolTokenSymbol={pool.tokenSymbol}
                tokenDecimals={pool.tokenDecimals}
                walletAddress={walletAddress}
            />
        </div>
    )
}
