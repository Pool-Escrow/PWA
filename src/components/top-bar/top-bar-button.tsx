'use client'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSmartAccount } from '@/hooks/use-smart-account'
import { usePrivy } from '@privy-io/react-auth'
import { toast } from 'sonner'
import UserAvatar from '../user-dropdown/user-avatar'

const notifyLoginError = (error: string) => {
    console.log('error', error)
    toast.error('Error, action canceled', {
        description: 'Please, try to log in again.',
        duration: 20,
    })
}

export default function TopBarButton() {
    const { login, error, loading } = useSmartAccount()
    const { ready, authenticated } = usePrivy()

    if (error) {
        notifyLoginError(error)
    }

    if (loading || !ready) return <Skeleton className='h-[30px] w-[46px] px-[10px] py-[5px]' />
    if (ready && authenticated) return <UserAvatar />

    return (
        <Button className='h-[30px] w-[46px] rounded-mini bg-cta px-[10px] py-[5px] text-[10px]' onClick={login}>
            Login
        </Button>
    )
}
