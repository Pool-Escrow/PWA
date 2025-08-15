'use client'

import { Link } from 'next-view-transitions'
import AdminBadge from '@/components/ui/admin-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@/hooks/use-user'
import { useUserRoles } from '@/hooks/use-user-roles'
import { generateAvatarUrl } from '@/lib/utils/avatar'

export default function UserAvatar() {
  const { authenticated } = useAuth()
  const { data: user, isLoading } = useUser()
  const { isAdmin, isHost, isSponsor } = useUserRoles()

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
    <Link href={`/profile/${address}`} className="relative block size-8">
      <Avatar className="size-8">
        <AvatarImage src={avatarUrl} alt="User avatar" />
        <AvatarFallback className="text-xs">{shortAddress}</AvatarFallback>
      </Avatar>
      {/* Show admin badge if user has admin role */}
      {isAdmin && (
        <div className="absolute -top-1 -right-1">
          <AdminBadge variant="admin" size="sm" />
        </div>
      )}
      {/* Show host badge if user has host role but not admin */}
      {!isAdmin && isHost && (
        <div className="absolute -top-1 -right-1">
          <AdminBadge variant="host" size="sm" />
        </div>
      )}
      {/* Show sponsor badge if user has sponsor role but not admin or host */}
      {!isAdmin && !isHost && isSponsor && (
        <div className="absolute -top-1 -right-1">
          <AdminBadge variant="sponsor" size="sm" />
        </div>
      )}
    </Link>
  )
}
