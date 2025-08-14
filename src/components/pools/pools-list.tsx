'use client'

import type { PoolItem } from '@/types/pools'
import PoolListCard from './pools-list-item'
import { motion } from 'framer-motion'

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
        cta: null,
        link: 'mailto:info@poolparty.cc',
        linkText: 'Contact us',
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
            <motion.div
                className='flex h-24 items-center justify-center rounded-3xl bg-white p-4'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <div className='flex flex-col items-center gap-1'>
                    <h2 className='text-sm font-semibold'>{title}</h2>
                    <p className='text-xs text-gray-600'>{message}</p>
                    <p className='text-xs text-gray-500'>{cta}</p>
                    {link && linkText && (
                        <a
                            href={link}
                            className=' text-xs text-blue-500 hover:underline'
                            target='_blank'
                            rel='noopener noreferrer'>
                            {linkText}
                        </a>
                    )}
                </div>
            </motion.div>
        )
    }

    return (
        <section className='flex flex-col gap-2 pb-4 select-none'>
            {pools?.length ? pools.map(pool => <PoolListCard key={pool.id} {...pool} />) : null}
        </section>
    )
}