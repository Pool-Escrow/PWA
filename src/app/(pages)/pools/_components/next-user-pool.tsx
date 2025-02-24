'use client'

import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

import { useAuth } from '@/app/_client/hooks/use-auth'
import { useUserNextPool } from '@/hooks/use-user-next-pool'
import { usePrivy } from '@privy-io/react-auth'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function NextUserPool() {
    const { ready, authenticated } = usePrivy()
    const { login } = useAuth()
    const { data: pools, isLoading, error } = useUserNextPool()
    const hasNextPool = !isLoading && !error && pools && pools.length > 0

    console.log('NextUserPool render:', {
        ready,
        authenticated,
        isLoading,
        error,
        poolsLength: pools?.length,
        hasNextPool,
    })

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <div className='flex shrink justify-between'>
                <h1 className='pl-[6px] text-lg font-semibold'>Your Pools</h1>
                {ready && authenticated && pools && pools.length > 0 && (
                    <Link href='/my-pools' className='inline-flex h-[30px] items-center gap-1 pr-[6px]'>
                        <motion.div
                            className='text-[11px] font-semibold text-[#4078FA]'
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            View All
                        </motion.div>
                        <motion.div
                            className='flex size-[30px] items-center justify-center rounded-full bg-white'
                            whileHover={{ scale: 1.05, backgroundColor: '#f0f0f0' }}
                            whileTap={{ scale: 0.95, backgroundColor: '#e5e5e5' }}>
                            <ChevronRightIcon className='size-6 text-[#4078FA]' />
                        </motion.div>
                    </Link>
                )}
            </div>
            <div className='mt-4'>
                {!ready || !authenticated ? (
                    <motion.div
                        className='flex h-24 items-center justify-center rounded-3xl bg-white p-4'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <div className='flex flex-col items-center gap-1'>
                            <h2 className='text-sm font-semibold'>Welcome to Pool</h2>
                            <p className='text-xs text-gray-600'>Ready to dive into your pool journey?</p>
                            <button onClick={login} className='mt-1 text-xs text-[#4078F4] hover:underline'>
                                Login to view your pools
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className='flex flex-col space-y-2'>
                        {hasNextPool ? (
                            pools?.map(pool => (
                                <Link key={pool.id} href={`/pool/${pool.id}`}>
                                    <motion.div
                                        className='flex h-24 items-center gap-[14px] rounded-3xl bg-white p-3 pr-4'
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}>
                                        <div className='relative size-[76px] shrink-0 overflow-hidden rounded-[16px] bg-neutral-200'>
                                            <Image
                                                src={pool.image || '/app/images/frog.png'}
                                                alt='Pool Image'
                                                fill
                                                priority
                                                sizes='72px'
                                                className='object-cover'
                                            />
                                        </div>
                                        <div className='flex flex-col gap-[5px] truncate'>
                                            <h1 className='truncate text-sm font-semibold'>{pool.name}</h1>
                                            <span className='truncate text-xs font-medium tracking-tight'>
                                                {`${pool.numParticipants}/${pool.softCap} Registered`}
                                            </span>
                                            <span className='truncate text-xs font-medium tracking-tight'>
                                                Starts {new Date(pool.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        ) : (
                            <motion.div
                                className='flex h-24 items-center justify-center rounded-3xl bg-white p-4'
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}>
                                <div className='flex flex-col items-center gap-1'>
                                    <h2 className='text-sm font-semibold'>Welcome to Pool</h2>
                                    <p className='text-xs text-gray-600'>You&apos;re ready to dive in!</p>
                                    <p className='text-xs text-gray-500'>Register to an upcoming pool below.</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
