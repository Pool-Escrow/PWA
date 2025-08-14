'use client'

import { Link } from 'next-view-transitions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { generateAvatarUrl } from '@/lib/utils/avatar'

export default function UserAvatar() {
  const { authenticated } = useAuth()
  const { data: user, isLoading } = useUser()

  // Don't show avatar if user is not authenticated
  if (!authenticated) {
    return null
  }

  if (isLoading) {
    return <div className="size-8 animate-pulse rounded-full bg-gray-200" />
  }

  if (user?.address == null) {
    return null
  }

  const address = user.address
  const shortAddress = address.slice(2, 4).toUpperCase()
  const avatarUrl = generateAvatarUrl(address)

  return (
    <Link href={`/profile/${address}`} className="block size-8">
      <Avatar className="size-8">
        <AvatarImage src={avatarUrl} alt="User avatar" />
        <AvatarFallback className="text-xs">{shortAddress}</AvatarFallback>
      </Avatar>
    </Link>
  )
}
