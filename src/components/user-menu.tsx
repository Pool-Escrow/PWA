'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
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
        <Button className='pool-button h-[30px] w-[46px] rounded-mini px-[10px] py-[5px] text-[10px]' onClick={login}>
            Login
        </Button>
    )
}
