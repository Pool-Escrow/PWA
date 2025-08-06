'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import UserAvatar from '@/components/user/user-avatar'

export default function UserMenu() {
  const { ready, authenticated, login } = usePrivy()

  if (!ready)
    return <Skeleton className="h-[30px] w-[46px] px-[10px] py-[5px]" />

  return authenticated
    ? (
        <UserAvatar />
      )
    : (
        <Button
          className="pool-button h-[30px] w-[46px] rounded-mini px-[10px] py-[5px] text-[10px]"
          onClick={login}
        >
          Login
        </Button>
      )
}
