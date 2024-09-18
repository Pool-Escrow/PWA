import { ChevronRightIcon } from 'lucide-react'
import Avatars from './avatars'
import Link from 'next/link'

interface PoolDetailsParticipantsProps {
    numParticipants: number
    avatarUrls: string[]
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
                        <div className='text-xs'>Participants</div>
                        <div className='inline-flex w-full items-center justify-between'>
                            <Avatars avatarUrls={avatarUrls} numPeople={numParticipants} />
                            <ChevronRightIcon className='size-3.5' />
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
