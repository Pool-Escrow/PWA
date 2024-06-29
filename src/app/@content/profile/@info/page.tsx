'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAccount } from 'wagmi'
import frog from '@/../public/images/frog.png'
import { useUserStore } from '@/stores/profile.store'
import Unlimit from '@/components/onramps/unlimit'

export default function ProfileHeader() {
    const account = useAccount()
    const { profile } = useUserStore()

    const truncatedAddress = (account.address ?? '').slice(0, 6) + '...' + (account.address ?? '').slice(-4)

    return (
        <header className='flex-center mt-4 flex-col gap-4'>
            <Avatar className='size-[73px] cursor-pointer' aria-label='User Avatar'>
                <AvatarImage alt='User Avatar' src={profile?.avatar || frog.src} />
                <AvatarFallback className='bg-[#d9d9d9]' />
            </Avatar>
            <div>{truncatedAddress}</div>
            <Unlimit email={"dev@poolparty.cc"} amount={"20"} purchaseCurrency={"USDT_XLAYER"}/>
        </header>
    )
}
