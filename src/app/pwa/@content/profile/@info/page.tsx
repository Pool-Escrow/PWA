'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAccount } from 'wagmi'
import frog from '@/../public/images/frog.png'
import { useUserStore } from '@/stores/profile.store'

import SponsoredTxn from '@/components/sponsored-txn/sponsored-txn-CoinbaseSmartWallet'
import { dropletAbi, dropletAddress } from '@/types/contracts'

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
            <SponsoredTxn
                text='Mint 1000 DROPLET'
                targetAddress='0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b'
                abi={dropletAbi}
                functionName='mint'
                args={[account.address, '1000000000000000000000']}
            />
        </header>
    )
}
