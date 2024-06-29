'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAccount } from 'wagmi'
import frog from '@/../public/images/frog.png'
import { useUserStore } from '@/stores/profile.store'

export default function ProfileHeader() {
    const account = useAccount()
    const { profile } = useUserStore()

    if (!account.address) {
        // TODO: redirect at this point?
        return null
    }

    const truncatedAddress = account.address.slice(0, 6) + '...' + account.address.slice(-4)

    return (
        <header className='flex-center mt-4 flex-col gap-4'>
            <Avatar className='size-[73px] cursor-pointer' aria-label='User Avatar'>
                <AvatarImage alt='User Avatar' src={profile?.avatar || frog.src} />
                <AvatarFallback className='bg-[#d9d9d9]' />
            </Avatar>
            <div>{truncatedAddress}</div>
        </header>
    )
}
