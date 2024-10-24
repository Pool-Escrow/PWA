'use client'

import { Button } from '@/app/_components/ui/button'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import SkipButton from './skip-button'
import UserAvatar from './user-avatar'
import UserDropdown from './user-dropdown'
import { useAuth } from '../../_client/hooks/use-auth'

export default function UserMenu() {
    const { login } = useAuth()
    const { ready, authenticated } = usePrivy()
    const pathname = usePathname()

    if (!ready) return <Skeleton className='h-[30px] w-[46px] px-[10px] py-[5px]' />

    if (ready && authenticated) {
        switch (true) {
            case pathname === '/profile':
                return <UserDropdown />
            case pathname === '/profile/new':
                return <SkipButton />
            default:
                return <UserAvatar />
        }
    }

    return (
        <Button className='h-[30px] w-[46px] rounded-mini bg-cta px-[10px] py-[5px] text-[10px]' onClick={login}>
            Login
        </Button>
    )
}
