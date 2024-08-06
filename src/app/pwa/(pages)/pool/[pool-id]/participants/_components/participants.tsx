'use client'

import { useEffect, useState, useMemo } from 'react'
import ParticipantCard from './participantRow'
import { usePoolDetails } from '../../ticket/_components/use-pool-details'
import { useAppStore } from '@/app/pwa/_client/providers/app-store.provider'
import { Route } from 'next'
import Link from 'next/link'
import { QrCodeIcon, SearchIcon } from 'lucide-react'
import { Input } from '@/app/pwa/_components/ui/input'
import { useUserDetailsDB } from './use-user-details'
import { formatAddress } from '@/app/pwa/_lib/utils/addresses'
import frog from '@/public/app/images/frog.png'

interface PoolParticipantsProps {
    poolId: string
}

const Participants = ({ poolId }: PoolParticipantsProps) => {
    const { poolDetails } = usePoolDetails(BigInt(poolId))
    const { setBottomBarContent, setTopBarTitle } = useAppStore(state => ({
        setBottomBarContent: state.setBottomBarContent,
        setTopBarTitle: state.setTopBarTitle,
    }))
    const [query, setQuery] = useState('')

    const participants = poolDetails?.poolDetailFromSC?.[5] || []

    // Fetch user details for all participants
    const participantDetails = participants.map(address => {
        const { userDetailsDB } = useUserDetailsDB(address)
        return {
            address,
            avatar: userDetailsDB?.userDetail?.avatar || frog.src,
            displayName: userDetailsDB?.userDetail?.displayName || formatAddress(address),
        }
    })

    const filteredParticipants = useMemo(() => {
        return participantDetails.filter(participant =>
            participant.displayName.toLowerCase().includes(query.toLowerCase()),
        )
    }, [participantDetails, query])

    useEffect(() => {
        setTopBarTitle('Manage Participants')
        return () => setBottomBarContent(null)
    }, [setTopBarTitle])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    return (
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white'>
            <div className='p-4'>
                <div className='relative mb-2 h-10'>
                    <div className='absolute left-4 top-[1px] z-10 flex h-full w-4 items-center'>
                        <SearchIcon size={16} />
                    </div>
                    <Link
                        href={`/pool/${poolId}/participants/` as Route}
                        className='absolute right-2 top-[1px] z-10 flex h-10 w-6 items-center'>
                        <QrCodeIcon size={16} />
                    </Link>

                    <Input
                        type='text'
                        value={query}
                        onChange={handleChange}
                        placeholder='Search'
                        className='mb-2 h-10 rounded-full px-10'
                    />
                </div>
                {filteredParticipants.map(participant => (
                    <ParticipantCard
                        key={participant.address}
                        address={participant.address}
                        avatar={participant.avatar}
                        displayName={participant.displayName}
                        poolId={poolId}
                        status='Registered'
                    />
                ))}
            </div>
        </div>
    )
}

export default Participants
