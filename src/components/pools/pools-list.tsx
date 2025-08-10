'use client'

import { useQuery } from '@tanstack/react-query'
import { Link } from 'next-view-transitions'
import { Skeleton } from '@/components/ui/skeletons'
import { Button } from '../ui/button'

interface Pool {
  id: string
  name: string
  description: string
  participants: number
  maxParticipants: number
  startDate: string
  status: 'upcoming' | 'live' | 'ended'
}

// Placeholder data for now
const mockPools: Pool[] = [
  {
    id: '1',
    name: 'The Original Pool Poker Party',
    description: 'Join us for an unforgettable night filled with laughter, drinks and poker!',
    participants: 140,
    maxParticipants: 200,
    startDate: '2h 14m',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Women\'s Lunch w/ Base',
    description: 'Networking lunch for women in tech',
    participants: 168,
    maxParticipants: 300,
    startDate: 'Mar 28, 2025',
    status: 'upcoming',
  },
  {
    id: '3',
    name: 'Arcade Corner w/ Tezza',
    description: 'Retro gaming tournament',
    participants: 77,
    maxParticipants: 150,
    startDate: 'Apr 12, 2025',
    status: 'upcoming',
  },
]

function PoolCard({ pool }: { pool: Pool }) {
  return (
    <Link href={`/pool/${pool.id}`}>
      <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="size-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{pool.name}</h3>
          <p className="text-sm text-gray-600">{pool.description}</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>
              {pool.participants}
              /
              {pool.maxParticipants}
              {' '}
              Registered
            </span>
            <span>
              Starts
              {pool.startDate}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PoolsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(id => (
        <div
          key={`skeleton-${id}`}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PoolsList() {
  const { data: pools, isLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async (): Promise<Pool[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockPools
    },
    staleTime: 30000, // 30 seconds
  })

  if (isLoading) {
    return <PoolsListSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Pools</h2>
        <Button
          className={`
            text-sm text-blue-600
            hover:text-blue-700
          `}
        >
          View All
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {pools?.map(pool => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </div>
    </div>
  )
}
