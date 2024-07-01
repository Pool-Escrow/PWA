// src/components/pool-detail/pool-detail.tsx
'use client'

import { usePoolDetails } from '@/lib/hooks/use-pool-details'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { useWallets } from '@privy-io/react-auth'
import { ChangeEvent, useEffect, useState } from 'react'
import ParticipantRow from '../common/other/participantRow'

interface PoolParticipantsProps {
    poolId: string
}
const Participants = (props: PoolParticipantsProps) => {
    const { poolDetails, isLoading, error } = usePoolDetails(BigInt(props.poolId))
    const { wallets } = useWallets()

    const participants = poolDetails?.poolDetailFromSC?.[5]
    const { showBar, hideBar, setContent } = useBottomBarStore(state => state)
    const [query, setQuery] = useState('')
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        console.log('Query', e.target.value)
        setQuery(e.target.value)
    }
    useEffect(() => {
        hideBar()
    }, [hideBar])

    return (
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white'>
            <div className='p-4'>
                {/* <div className='relative mb-2 h-10'>
                    <div className='absolute left-4 flex h-full w-4 items-center bg-black text-black'>
                        <Image src={searchIcon.src} alt='Back' width={12} height={12} />
                    </div>
                    <Link
                        href={`/pool/${props.poolId}/participants/`}
                        className='absolute right-0 flex h-10 w-6 items-center'
                        // onClick={onQrButtonClicked}
                    >
                        <span className='flex h-full w-full items-center'>
                            <svg
                                width='14'
                                height='14'
                                viewBox='0 0 14 14'
                                fill='black'
                                xmlns='http://www.w3.org/2000/svg'>
                                <path
                                    d='M1.75 6.41667H6.41667V1.75H1.75V6.41667ZM2.91667 2.91667H5.25V5.25H2.91667V2.91667ZM1.75 12.25H6.41667V7.58333H1.75V12.25ZM2.91667 8.75H5.25V11.0833H2.91667V8.75ZM7.58333 1.75V6.41667H12.25V1.75H7.58333ZM11.0833 5.25H8.75V2.91667H11.0833V5.25ZM11.0833 11.0833H12.25V12.25H11.0833V11.0833ZM7.58333 7.58333H8.75V8.75H7.58333V7.58333ZM8.75 8.75H9.91667V9.91667H8.75V8.75ZM7.58333 9.91667H8.75V11.0833H7.58333V9.91667ZM8.75 11.0833H9.91667V12.25H8.75V11.0833ZM9.91667 9.91667H11.0833V11.0833H9.91667V9.91667ZM9.91667 7.58333H11.0833V8.75H9.91667V7.58333ZM11.0833 8.75H12.25V9.91667H11.0833V8.75Z'
                                    fill='black'
                                />
                            </svg>
                        </span>
                    </Link>

                    <Input
                        type='text'
                        value={query}
                        onChange={handleChange}
                        placeholder='Search'
                        className='mb-2 h-10 rounded-full px-10'
                    />
                </div> */}

                {(participants?.length ?? 0) > 0 ? (
                    participants?.map((participant, index) => {
                        return <ParticipantRow poolId={props.poolId} key={participant} address={participant} />
                    })
                ) : (
                    <div>No participants found</div>
                )}
            </div>
        </div>
    )
}

export default Participants
