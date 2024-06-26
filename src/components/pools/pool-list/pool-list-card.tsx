// src/components/pools/pool-list/pool-list-card.tsx

import { getStatusString } from '@/lib/utils/get-relative-date'
import { cn } from '@/lib/utils/tailwind'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getPoolStatus } from '@/lib/utils/get-pool.status'

type PoolCardProps = Pick<PoolFrontend, 'id' | 'name' | 'endDate' | 'startDate'>

export default function PoolCard({ id, name, endDate, startDate }: PoolCardProps) {
    const status = getPoolStatus({ startDate, endDate })

    return (
        <Link href={`/pool/${id}`}>
            <motion.div
                className='flex h-24 items-center gap-[14px] rounded-[2rem] bg-[#f4f4f4] p-3 pr-4'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <div className='relative size-[72px] shrink-0 overflow-hidden rounded-[16px]'>
                    <Image
                        src='/images/frog.png'
                        alt='frog'
                        style={{ objectFit: 'contain' }}
                        fill
                        sizes='72px'
                        priority
                    />
                    {status !== 'past' && (
                        <div
                            className={cn(
                                'absolute bottom-0 flex w-full items-center justify-center bg-black/40 text-center text-[10px] text-white backdrop-blur-md',
                                status === 'live' &&
                                    'pr-[9px] before:mr-[4px] before:size-[5px] before:animate-pulse before:rounded-full before:bg-[#24ff00]',
                            )}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                    )}
                </div>
                <div className='flex flex-col gap-[5px] truncate'>
                    <h1 className='truncate text-sm font-semibold'>{name}</h1>
                    <span className='truncate text-xs font-medium tracking-tight'>0/200 Registered</span>
                    <span className='truncate text-xs font-medium tracking-tight'>
                        {getStatusString({ status, startDate, endDate })}
                    </span>
                </div>
            </motion.div>
        </Link>
    )
}
