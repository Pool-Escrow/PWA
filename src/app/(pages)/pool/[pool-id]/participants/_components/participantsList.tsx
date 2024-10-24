'use client'

import { useEffect, useState, useMemo } from 'react'
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
    const [savedPayouts, setSavedPayouts] = useState<Record<string, any>>({})

    useEffect(() => {
        const storePayouts = usePayoutStore.getState().payouts[poolId] || []
        setSavedPayouts(
            storePayouts.reduce(
                (acc, payout) => {
                    acc[payout.participantAddress] = payout
                    return acc
                },
                {} as Record<string, any>,
            ),
        )
    }, [poolId])

    const tabParticipants = useMemo(() => {
        const filteredParticipants =
            participants?.filter(participant => {
                switch (tabValue) {
                    case TabValue.Registered:
                        return true
                    case TabValue.CheckedIn:
                        return participant.checkedInAt != null
                    case TabValue.Winners:
                        return participant.amountWon > 0 || savedPayouts[participant.address]
                    default:
                        return true
                }
            }) || []
        return filteredParticipants.sort((a, b) => {
            // Helper function to determine participant category
            const getCategory = (p: typeof a) => {
                if (p.amountClaimed > 0) return 5
                if (p.amountWon > 0) return 4
                if (savedPayouts[p.address]) return 3
                if (p.checkedInAt) return 2
                return 1
            }

            const categoryA = getCategory(a)
            const categoryB = getCategory(b)

            // Sort by category first
            if (categoryA !== categoryB) {
                return categoryA - categoryB
            }

            // If in the same category, sort alphabetically by displayName
            return a.displayName.localeCompare(b.displayName)
        })
    }, [participants, tabValue, savedPayouts])

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
