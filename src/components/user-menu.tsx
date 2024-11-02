'use client'

import { Button } from '@/app/_components/ui/button'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { usePrivy } from '@privy-io/react-auth'
import UserAvatar from './user-avatar'
import { useAuth } from '@/app/_client/hooks/use-auth'

export default function UserMenu() {
    const { login } = useAuth()
    const { ready, authenticated } = usePrivy()

    if (!ready) return <Skeleton className='h-[30px] w-[46px] px-[10px] py-[5px]' />

    if (ready && authenticated) {
        return <UserAvatar />
    }

    return (
        <Button className='h-[30px] w-[46px] rounded-mini bg-cta px-[10px] py-[5px] text-[10px]' onClick={login}>
            Login
        </Button>
    )
}
