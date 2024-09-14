'use client'

import { Avatar, AvatarImage } from '@/app/pwa/_components/ui/avatar'
import { Route } from 'next'
import Link from 'next/link'
import ReactBlockies from 'react-blockies'
import { useAccount } from 'wagmi'

interface UserAvatarProps {
    userAvatar: string | null
}

export default function UserAvatar({ userAvatar }: UserAvatarProps) {
    const { address } = useAccount()

    return (
        <Avatar className='size-10 cursor-pointer' aria-label='Go to Profile' asChild>
            <Link href={'/profile' as Route}>
                {userAvatar ? (
                    <AvatarImage alt='User Avatar' src={userAvatar} />
                ) : (
                    <ReactBlockies seed={address || '0x'} size={10} />
                )}
            </Link>
        </Avatar>
    )
}
