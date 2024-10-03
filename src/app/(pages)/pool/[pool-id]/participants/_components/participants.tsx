'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import Link from 'next/link'
import { QrCodeIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/app/_components/ui/input'
import ParticipantCard from './participantRow'
import { useParticipants } from '@/hooks/use-participants'

interface PoolParticipantsProps {
    poolId: string
    isAdmin: boolean
}

const Participants = ({ poolId, isAdmin }: PoolParticipantsProps) => {
    const setTopBarTitle = useAppStore(state => state.setTopBarTitle)
    const [query, setQuery] = useState('')
    const { data: participants, isLoading, error } = useParticipants(poolId)

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

    if (isLoading) return <div>Loading participants...</div>
    if (error) return <div>Error loading participants</div>

    return (
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white'>
            <div className='p-4'>
                <SearchBar query={query} onChange={handleChange} poolId={poolId} isAdmin={isAdmin} />
                <ParticipantList participants={filteredParticipants} poolId={poolId} isAdmin={isAdmin} />
            </div>
        </div>
    )
}

const SearchBar = ({
    query,
    onChange,
    poolId,
    isAdmin,
}: {
    query: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    poolId: string
    isAdmin: boolean
}) => (
    <div className='relative mb-2 h-10'>
        <div className='absolute left-4 top-[1px] z-10 flex h-full w-4 items-center'>
            <SearchIcon size={16} />
        </div>
        {isAdmin && (
            <Link
                href={`/pool/${poolId}/participants/`}
                className='absolute right-2 top-[1px] z-10 flex h-10 w-6 items-center'>
                <QrCodeIcon size={16} />
            </Link>
        )}
        <Input
            type='text'
            value={query}
            onChange={onChange}
            placeholder='Search'
            className='mb-2 h-10 rounded-full px-10'
        />
    </div>
)

const ParticipantList = ({
    participants,
    poolId,
    isAdmin,
}: {
    participants: ReturnType<typeof useParticipants>['data']
    poolId: string
    isAdmin: boolean
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
                />
            ))
        ) : (
            <p>No participants found.</p>
        )}
    </>
)

export default Participants
