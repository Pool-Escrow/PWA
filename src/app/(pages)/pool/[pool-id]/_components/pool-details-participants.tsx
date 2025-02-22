import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import type { Address } from 'viem'
import Avatars from './avatars'

interface PoolDetailsParticipantsProps {
    numParticipants: number
    avatarUrls: Array<{ url?: string; address: Address }>
    poolId: string
}

export default function PoolDetailsParticipants({
    numParticipants = 0,
    avatarUrls,
    poolId,
}: PoolDetailsParticipantsProps) {
    return (
        <div className='space-y-2'>
            {numParticipants > 0 ? (
                <>
                    <Link href={`/pool/${poolId}/participants`}>
                        <div className='pb-2 text-xs'>Participants</div>
                        <div className='inline-flex w-full items-center justify-between'>
                            <Avatars avatarUrls={avatarUrls} numPeople={numParticipants} />
                            <div className='rounded-full p-1 active:bg-white'>
                                <ChevronRightIcon className='size-3.5' />
                            </div>
                        </div>
                    </Link>
                </>
            ) : (
                <>
                    <h1 className='text-xs font-semibold'>No participants yet 🤔</h1>
                    <p className='w-full text-center text-sm'>Be the first to join!</p>
                </>
            )}
        </div>
    )
}
