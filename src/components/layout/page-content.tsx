'use client'

import UpcomingPoolsList from '@/components/pools/upcoming-pools-list'
import UserPoolsList from '@/components/pools/user-pools-list'
import { useAuth } from '@/hooks/use-auth'

export default function PageContent() {
  const { authenticated } = useAuth()

  return (
    <div
      className="mobile-scroll-container flex-1 overflow-y-auto"
      style={{
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      <div className={`
        space-y-4 px-safe-or-2
        ${!authenticated ? 'pb-32' : 'pb-safe'}
      `}
      >
        <UserPoolsList />
        <UpcomingPoolsList />
      </div>
    </div>
  )
}
