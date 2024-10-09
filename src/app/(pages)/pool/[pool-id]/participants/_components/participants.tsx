'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import ParticipantCard from './participantRow'
import { useParticipants } from '@/hooks/use-participants'
import SearchBar from './searchBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { PoolDetailsDTO } from '../../_lib/definitions'

interface PoolParticipantsProps {
    poolId: string
    isAdmin: boolean
    poolData: PoolDetailsDTO
}

enum ParticipantStatus {
    Registered = 'registered',
    CheckedIn = 'checkedIn',
    Winners = 'winners',
}

const Participants = ({ poolId, isAdmin, poolData }: PoolParticipantsProps) => {
    const setTopBarTitle = useAppStore(state => state.setTopBarTitle)
    const [query, setQuery] = useState('')
    const { data: participants, isLoading, error } = useParticipants(poolId)
    const [currentTab, setCurrentTab] = useState(ParticipantStatus.Registered)

    const filteredParticipants = useMemo(() => {
        return (
            participants?.filter(participant => participant.displayName.toLowerCase().includes(query.toLowerCase())) ||
            []
        )
    }, [participants, query])

    useEffect(() => {
        setTopBarTitle('Manage Participants')
        return () => setTopBarTitle(null)
    }, [setTopBarTitle])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    const handleTabChange = (value: ParticipantStatus) => {
        setCurrentTab(value)
    }

    if (isLoading) return <div>Loading participants...</div>
    if (error) return <div>Error loading participants</div>

    return (
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white'>
            <div className='p-4'>
                <SearchBar query={query} onChange={handleChange} poolId={poolId} isAdmin={isAdmin} />
                <Tabs
                    defaultValue={ParticipantStatus.Registered}
                    className='w-full'
                    onValueChange={(value: string) => handleTabChange(value as ParticipantStatus)}>
                    <TabsList className='z-10 flex w-full justify-start space-x-0 rounded-none bg-white p-0 md:space-x-8'>
                        <TabsTrigger value={ParticipantStatus.Registered}>Registered</TabsTrigger>
                        <TabsTrigger value={ParticipantStatus.CheckedIn}>Checked in</TabsTrigger>
                        <TabsTrigger value={ParticipantStatus.Winners}>Winners</TabsTrigger>
                        {/* <TabsTrigger value='refunded'>Refunded</TabsTrigger> */}
                    </TabsList>
                    <TabsContent value='registered'></TabsContent>
                    <TabsContent value='checkedIn'></TabsContent>
                    <TabsContent value='winners'></TabsContent>
                    {/* <TabsContent value='refunded'>Refunded</TabsContent> */}
                    <ParticipantList
                        participants={filteredParticipants}
                        poolId={poolId}
                        isAdmin={isAdmin}
                        tabValue={currentTab}
                        poolData={poolData}
                    />
                </Tabs>
            </div>
        </div>
    )
}

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
    tabValue: ParticipantStatus
    poolData: PoolDetailsDTO
}) => (
    <>
        {participants && participants.length > 0 ? (
            participants.map(participant => (
                <ParticipantCard
                    key={participant.address}
                    address={participant.address}
                    avatar={participant.avatar}
                    displayName={participant.displayName}
                    poolId={poolId}
                    status='Registered'
                    isAdmin={isAdmin}
                    wonAmount={poolData.wonAmount}
                    claimedAmount={poolData.claimedAmount}
                />
            ))
        ) : (
            <p>No participants found.</p>
        )}
    </>
)

export default Participants
