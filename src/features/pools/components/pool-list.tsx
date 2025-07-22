'use client'

import type { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { motion } from 'framer-motion'
import { LoaderIcon } from 'lucide-react'
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
        cta: null,
        link: 'mailto:info@poolparty.cc',
        linkText: 'Contact us',
    },
}

/* 
bannerImage
: 
"https://gyalvpenhktgsmrrjmxv.supabase.co/storage/v1/object/public/images/389/bannerImage.png"
contract_id
: 
172
createdAt
: 
"2025-06-20T06:13:41.347+00:00"
description
: 
"Test pool description"
endDate
: 
"2025-06-20T16:11:48+00:00"
internal_id
: 
389
name
: 
"Test pool 03"
price
: 
0
required_acceptance
: 
false
softCap
: 
1
startDate
: 
"2025-06-20T15:20:48+00:00"
status
: 
"unconfirmed"
termsURL
: 
""
tokenAddress
: 
"0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b"
updatedAt
: 
"2025-06-20T06:13:41.347+00:00"*/

export default function PoolList({
    pools,
    name = 'feed',
    isLoading,
}: {
    pools?: PoolItem[] | null
    name?: string
    isLoading?: boolean
}) {
    if (isLoading) {
        return (
            <div className='flex h-24 items-center justify-center rounded-3xl bg-white p-4'>
                <LoaderIcon className='size-4 animate-spin' />
            </div>
        )
    }

    if (!pools || pools.length === 0) {
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
                            className='text-xs text-blue-500 hover:underline'
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
        <section className='flex flex-col gap-2'>
            {pools?.length
                ? pools.map(pool => (
                      <PoolListCard
                          key={pool.id}
                          endDate={pool.endDate}
                          id={pool.id}
                          image={pool.image}
                          name={pool.name}
                          numParticipants={pool.numParticipants}
                          softCap={pool.softCap}
                          startDate={pool.startDate}
                          status={pool.status as POOLSTATUS}
                      />
                  ))
                : null}
        </section>
    )
}
