'use client'

import { useQuery } from '@tanstack/react-query'
import AdminBadge from '@/components/ui/admin-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserRoles } from '@/hooks/use-user-roles'
import { Button } from '../ui/button'
import UserBalances from './user-balances'

type UserProfileData = App.User & {
  joinedDate: string
  poolsParticipated: number
  totalWinnings: number
}

type UserProfileProps = App.WithAddress

function UserProfileSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Avatar and basic info */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Balance section */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-8 w-36" />
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function UserProfile({ address }: UserProfileProps) {
  const { isAdmin, isHost, isSponsor } = useUserRoles()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', address],
    queryFn: async (): Promise<UserProfileData> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        address,
        displayName: 'Alexi Maker',
        bio: 'Crypto enthusiast and pool player',
        joinedDate: 'March 2024',
        poolsParticipated: 12,
        totalWinnings: 3873.21,
        ready: true,
      }
    },
    staleTime: 60000, // 1 minute
  })

  if (isLoading) {
    return <UserProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Profile not found</p>
      </div>
    )
  }

  const displayName = profile == null ? `${address.slice(0, 6)}...${address.slice(-4)}` : profile.displayName

  return (
    <div className="space-y-6 p-4">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="size-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          {/* Show admin badge if user has admin role */}
          {isAdmin && (
            <div className="absolute -top-1 -right-1">
              <AdminBadge variant="admin" size="md" />
            </div>
          )}
          {/* Show host badge if user has host role but not admin */}
          {!isAdmin && isHost && (
            <div className="absolute -top-1 -right-1">
              <AdminBadge variant="host" size="md" />
            </div>
          )}
          {/* Show sponsor badge if user has sponsor role but not admin or host */}
          {!isAdmin && !isHost && isSponsor && (
            <div className="absolute -top-1 -right-1">
              <AdminBadge variant="sponsor" size="md" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">
              {displayName}
            </h1>
            {/* Show role badges next to name */}
            {isAdmin && <AdminBadge variant="admin" size="sm" />}
            {!isAdmin && isHost && <AdminBadge variant="host" size="sm" />}
            {!isAdmin && !isHost && isSponsor && <AdminBadge variant="sponsor" size="sm" />}
          </div>
          <p className="text-sm text-gray-500">
            {address.slice(0, 6)}
            ...
            {address.slice(-4)}
          </p>
          {profile.bio != null && <p className="mt-1 text-sm text-gray-600">{profile.bio}</p>}
        </div>
      </div>

      {/* Balance Section */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Total Balance</h2>
        <div className="mt-2">
          <UserBalances />
        </div>
      </div>

      {/* Claimable Winnings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Claimable Winnings</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-orange-100" />
              <div>
                <p className="font-medium text-gray-900">Ping Pong Party</p>
                <p className="text-sm text-blue-600">Winner</p>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              200 USDC
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-purple-100" />
              <div>
                <p className="font-medium text-gray-900">Zip Zip Zoom</p>
                <p className="text-sm text-blue-600">Winner</p>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              100 USDC
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-green-100" />
              <div>
                <p className="font-medium text-gray-900">Brussels Holdem</p>
                <p className="text-sm text-blue-600">Winner</p>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              100 USDC
            </div>
          </div>
        </div>

        <Button
          className={`
            w-full rounded-lg bg-blue-600 py-3 font-medium text-white
            hover:bg-blue-700
          `}
        >
          Claim All
        </Button>
      </div>
    </div>
  )
}
