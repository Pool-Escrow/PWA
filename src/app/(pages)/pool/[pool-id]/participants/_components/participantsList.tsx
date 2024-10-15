'use client'

import ParticipantCard from './participantCard'
import { useParticipants } from '@/hooks/use-participants'
import { PoolDetailsDTO } from '../../_lib/definitions'
import { usePayoutStore } from '@/app/_client/stores/payout-store'
import { TabValue } from './participants'

const ParticipantList = ({
    participants,
    poolId,
    isAdmin,
    tabValue,
    poolData,
}: {
    participants: ReturnType<typeof useParticipants>['data']
    poolId: string
    isAdmin: boolean
    tabValue: TabValue
    poolData: PoolDetailsDTO
}) => {
    const { payouts } = usePayoutStore()
    const tabParticipants = participants?.filter(participant => {
        switch (tabValue) {
            case TabValue.Registered:
                return true
            case TabValue.CheckedIn:
                return participant.checkedInAt != null
            case TabValue.Winners:
                return (
                    participant.amountWon > 0 ||
                    (payouts[poolId] && payouts[poolId].some(p => p.participantAddress === participant.address))
                )
            default:
                return true
        }
    })

    return (
        <>
            {tabParticipants && tabParticipants.length > 0 ? (
                tabParticipants.map(participant => (
                    <ParticipantCard
                        key={participant.address}
                        address={participant.address}
                        avatar={participant.avatar}
                        displayName={participant.displayName}
                        poolId={poolId}
                        status={'Registered'}
                        tabValue={tabValue}
                        checkInAt={participant.checkedInAt}
                        isAdmin={isAdmin}
                        wonAmount={participant.amountWon}
                        claimedAmount={participant.amountClaimed}
                        tokenDecimals={poolData.tokenDecimals}
                    />
                ))
            ) : (
                <p>No participants found.</p>
            )}
        </>
    )
}

export default ParticipantList