'use client'

import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { useUserPoolRegistration } from '@/hooks/use-user-pool-registration'
import { POOL_STATUSES_CONFIGS } from '@/lib/consts/pool.consts'
import { getStatusString } from '@/lib/utils/get-relative-date'
import { cn } from '@/lib/utils/tailwind'
import frog from '@/public/app/images/frog.png'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo } from 'react'

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
    const queryClient = useQueryClient()
    const { isRegistered, isLoading: isRegistrationLoading } = useUserPoolRegistration(id)

    // Calculate dateString using useMemo instead of useState + useEffect to avoid setState during render
    const dateString = useMemo(() => {
        return getStatusString({ status, startDate, endDate })
    }, [status, startDate, endDate])

    const prefetch = () => {
        void queryClient.prefetchQuery({
            queryKey: ['pool-details', id],
            queryFn: getPoolDetailsById,
            staleTime: 60000,
        })
    }

    // only show ended
    const resolvedImage = image || frog.src

    if (!id) return <PoolCardSkeleton />

    return (
        <Link href={`/pool/${id}`} onMouseEnter={prefetch} onFocus={prefetch}>
            <motion.div
                className='flex h-24 items-center gap-[14px] rounded-3xl bg-white p-3 pr-4'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <div className='relative size-[76px] shrink-0 overflow-hidden rounded-[16px] bg-neutral-200'>
                    <Image src={resolvedImage} alt='Pool Image' fill priority sizes='72px' className='object-cover' />
                    {status !== POOLSTATUS.ENDED && status in POOL_STATUSES_CONFIGS && (
                        <div className='absolute bottom-0 z-10 flex w-full items-center bg-black/40 backdrop-blur-md'>
                            <div
                                style={{ backgroundColor: POOL_STATUSES_CONFIGS[status as POOLSTATUS].color }}
                                // eslint-disable-next-line tailwindcss/no-custom-classname
                                className={'mr-0.4 mb-0.5 ml-2 size-[5px] animate-pulse rounded-full'}
                            />
                            <div
                                className={cn(
                                    'flex w-full items-center justify-center pb-0.5 pr-[6px] text-center text-[10px] text-white',
                                    status === POOLSTATUS.INACTIVE || POOLSTATUS.DEPOSIT_ENABLED,
                                )}>
                                {POOL_STATUSES_CONFIGS[status as POOLSTATUS]?.name}
                            </div>
                        </div>
                    )}
                </div>
                <div className='flex flex-col gap-[5px] truncate'>
                    <div className='flex items-center gap-2'>
                        <h1 className='truncate text-sm font-semibold'>{name}</h1>
                        {isRegistered && !isRegistrationLoading && (
                            <Badge variant='success' className='flex items-center gap-1 px-2 py-0.5 text-xs'>
                                <CheckCircle className='size-3' />
                                Registered
                            </Badge>
                        )}
                    </div>
                    <span className='truncate text-xs font-medium tracking-tight'>{`${numParticipants}/${softCap} Registered`}</span>
                    <span className='truncate text-xs font-medium tracking-tight'>{dateString}</span>
                </div>
            </motion.div>
        </Link>
    )
}
