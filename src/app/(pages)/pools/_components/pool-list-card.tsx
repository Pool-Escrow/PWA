'use client'

import { getStatusString } from '@/app/_lib/utils/get-relative-date'
import {POOLSTATUS} from '@/app/(pages)/pool/[pool-id]/_lib/definitions';
import {POOL_STATUSES_CONFIGS} from '@/app/_lib/consts/pool.consts';
import { cn } from '@/lib/utils/tailwind'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import frog from '@/public/app/images/frog.png'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'

interface PoolItem {
    id: string
    name: string
    image: string
    startDate: Date
    endDate: Date
    status: POOLSTATUS | string
    numParticipants: number
    softCap: number
}

const PoolCardSkeleton = () => {
    return (
        <Skeleton className='flex h-24 items-center gap-[14px] rounded-[2rem] bg-[#f4f4f4] p-3 pr-4'>
            <Skeleton className='size-[72px] rounded-[16px] bg-[#36a0f7]/20' />
            <div className='flex flex-col gap-[5px]'>
                <Skeleton className='h-4 w-10 bg-[#36a0f7]/20' />
                <Skeleton className='h-4 w-16 bg-[#36a0f7]/20' />
                <Skeleton className='h-4 w-28 bg-[#36a0f7]/20' />
            </div>
        </Skeleton>
    )
}

export default function PoolListCard({
    name,
    startDate,
    endDate,
    id,
    status,
    image,
    numParticipants,
    softCap,
}: PoolItem) {
    const [dateString, setDateString] = useState<string>('Date information unavailable')
    const queryClient = useQueryClient()

    const prefetch = () => {
        queryClient.prefetchQuery({
            queryKey: ['pool-details', id],
            queryFn: getPoolDetailsById,
            staleTime: 60000,
        })
    }

    // only show ended 
    const resolvedImage = image || frog.src

    useEffect(() => {
        setDateString(getStatusString({ status, startDate, endDate }))
    }, [status, startDate, endDate])

    if (!id) return <PoolCardSkeleton />

    return (
        <Link href={`/pool/${id}`} onMouseEnter={prefetch} onFocus={prefetch}>
            <motion.div
                className='flex h-24 items-center gap-[14px] rounded-[1.5rem] bg-[#f4f4f4] p-3 pr-4'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <div className='relative size-[76px] shrink-0 overflow-hidden rounded-[16px] bg-neutral-200'>
                    <Image src={resolvedImage} alt='Pool Image' fill priority sizes='72px' className='object-cover' />
                    {status !== POOLSTATUS.ENDED && status in POOL_STATUSES_CONFIGS && (
                        <div className='flex absolute bottom-0 items-center z-10 bg-black/40 backdrop-blur-md w-full'>
                            <div style={{ backgroundColor: POOL_STATUSES_CONFIGS[status].color }} className={'ml-2 mr-0.4 mb-0.5 size-[5px] rounded-full animate-pulse'} />
                            <div
                                className={cn(
                                    'flex w-full items-center justify-center pr-[6px] pb-0.5 text-center text-[10px] text-white',
                                    status === POOLSTATUS.INACTIVE || POOLSTATUS.DEPOSIT_ENABLED,
                                )}>
                                {POOL_STATUSES_CONFIGS[status]?.name}
                            </div>
                        </div>
                    )}
                </div>
                <div className='flex flex-col gap-[5px] truncate'>
                    <h1 className='truncate text-sm font-semibold'>{name}</h1>
                    <span className='truncate text-xs font-medium tracking-tight'>{`${numParticipants}/${softCap} Registered`}</span>
                    <span className='truncate text-xs font-medium tracking-tight'>{dateString}</span>
                </div>
            </motion.div>
        </Link>
    )
}
