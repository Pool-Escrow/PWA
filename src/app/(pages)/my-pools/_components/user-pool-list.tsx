'use client'

import type { PoolItem } from '@/lib/entities/models/pool-item'
import PoolListCard from '../../pools/_components/pool-list-card'

const poolMessages = {
    upcoming: {
        title: 'No Upcoming Pools',
        message: "You haven't joined any upcoming pools yet.",
        cta: 'Explore and join a pool to get started.',
    },
    past: {
        title: 'No Past Pools',
        message: "You haven't participated in any pools yet.",
        cta: 'Join a pool to start your journey!',
    },
}

export default function UserPoolList({ pools, name }: { pools: PoolItem[]; name: 'upcoming' | 'past' }) {
    if (pools.length === 0) {
        const { title, message, cta } = poolMessages[name]
        return (
            <div className='flex-center h-80 flex-col px-4 text-center animate-in'>
                <h1 className='mb-4 text-lg font-semibold'>{title}</h1>
                <p className='mb-2 text-sm'>{message}</p>
                <p className='mx-auto max-w-xs text-sm leading-relaxed text-gray-500'>{cta}</p>
            </div>
        )
    }

    return (
        <section className='flex flex-col gap-4'>
            {pools.map(pool => (
                <PoolListCard key={pool.id} {...pool} />
            ))}
        </section>
    )
}
