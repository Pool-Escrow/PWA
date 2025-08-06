'use client'

import { Link } from 'next-view-transitions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '@/hooks/use-user'
import { generateAvatarUrl } from '@/lib/utils/avatar'

export default function UserAvatar() {
  const { data: user, isLoading } = useUser()

  if (isLoading) {
    return <div className="size-8 animate-pulse rounded-full bg-gray-200" />
  }

  if (user?.address == null) {
    return <div className="size-8 animate-pulse rounded-full bg-gray-200" />
  }

  const address = user.address
  const shortAddress = address.slice(2, 4).toUpperCase()
  const avatarUrl = generateAvatarUrl(address)

  return (
    <Link href={`/profile/${address}`} className="block">
      <Avatar className="size-8">
        <AvatarImage src={avatarUrl} alt="User avatar" />
        <AvatarFallback className="text-xs">{shortAddress}</AvatarFallback>
      </Avatar>
    </Link>
  )
}
