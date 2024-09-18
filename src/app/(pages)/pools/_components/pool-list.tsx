'use client'

import type { PoolItem } from '@/app/_lib/entities/models/pool-item'
import PoolListCard from './pool-list-card'

const poolMessages = {
    upcoming: {
        title: 'No Pools on Your Horizon',
        message: 'Time to dive in! Ready to make some waves?',
        cta: 'Explore and join a pool to get started.',
        link: null,
        linkText: null,
    },
    past: {
        title: 'Your Pool History Awaits',
        message: 'Waiting for your first splash!',
        cta: 'Your past pools will be here. What will be your first?',
        link: null,
        linkText: null,
    },
    feed: {
        title: 'No Upcoming Pools Yet',
        message: "We're working on bringing exciting pools to you!",
        cta: 'Want to create or sponsor a pool?',
        link: 'https://form.asana.com/?k=Qx1HYy3c8KcgfHyWszZnyA&d=1207858482725448',
        linkText: 'Tell us about it',
    },
}

export default function PoolList({ pools, name = 'feed' }: { pools?: PoolItem[] | null; name?: string }) {
    if (pools?.length === 0) {
        const defaultMessage = {
            title: 'No Pools Available',
            message: 'There are currently no pools to display.',
            cta: 'Check back later for new pools.',
            link: null,
            linkText: null,
        }
        const { title, message, cta, link, linkText } =
            poolMessages[name as keyof typeof poolMessages] || defaultMessage
        return (
            <section className='flex-center flex-1 flex-col px-4 text-center'>
                <h1 className='mb-4 text-lg font-semibold'>{title}</h1>
                <p className='mb-2 text-sm'>{message}</p>
                <p className='mx-auto max-w-xs text-sm leading-relaxed text-gray-500'>{cta}</p>
                {link && linkText && (
                    <a
                        href={link}
                        className='mt-4 text-sm text-blue-500 hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'>
                        {linkText}
                    </a>
                )}
            </section>
        )
    }

    return (
        <section className='flex flex-col gap-4 pb-4'>
            {pools?.length ? pools.map(pool => <PoolListCard key={pool.id} {...pool} />) : null}
        </section>
    )
}
