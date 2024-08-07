import { Avatar, AvatarFallback, AvatarImage } from '@/app/pwa/_components/ui/avatar'
import { cn } from '@/lib/utils/tailwind'
import Link from 'next/link'
import type { Address } from 'viem'
import { Route } from 'next'

interface ParticipantCardProps {
    address: Address
    avatar: string
    displayName: string
    poolId: string
    status?: string
}

export default function ParticipantCard({
    address,
    avatar,
    displayName,
    poolId,
    status = 'Registered',
}: ParticipantCardProps) {
    return (
        <Link
            className={cn('bottom-2 flex flex-row space-x-4 border-b-[1px] border-[#E9F1F5] py-4')}
            href={`/pool/${poolId}/participants/${address}` as Route}>
            <Avatar className='size-[48px]' aria-label='User Avatar'>
                <AvatarImage alt='User Avatar' src={avatar} />
                <AvatarFallback className='bg-[#d9d9d9]' />
            </Avatar>
            <div className='flex flex-1 flex-col'>
                <h4 className='overflow-hidden text-[12pt] font-medium text-black'>{displayName}</h4>
                <p className={`fontRegistered text-[10pt] text-[#6993FF]`}>{status}</p>
            </div>
        </Link>
    )
}
