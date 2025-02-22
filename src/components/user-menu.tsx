'use client'

import { useAuth } from '@/app/_client/hooks/use-auth'
import { Button } from '@/app/_components/ui/button'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { usePrivy } from '@privy-io/react-auth'
import { usePathname } from 'next/navigation'
import UserAvatar from './user-avatar'

export default function UserMenu() {
    const { login } = useAuth()
    const { ready, authenticated } = usePrivy()
    const pathname = usePathname()
    const isMainPage = pathname === '/pools' || pathname === '/'

    if (!ready) return <Skeleton className='h-[30px] w-[46px] px-[10px] py-[5px]' />

    if (ready && authenticated) {
        return <UserAvatar />
    }

    // Don't show the login button in the top bar if we're on the main page
    if (isMainPage) {
        return null
    }

    return (
        <Button className='pool-button rounded-mini h-[30px] w-[46px] px-[10px] py-[5px] text-[10px]' onClick={login}>
            Login
        </Button>
    )
}
