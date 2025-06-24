'use client'

import { useUserPools } from '@/features/pools/hooks/use-user-pools'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useMemo } from 'react'
import { UserPoolsSkeleton } from './user-pools-skeleton'

/**
 * Enhanced UserPools Component
 *
 * Keeps the mobile design but with technical improvements:
 * - Fixed RPC connectivity (Base Sepolia)
 * - Reduced re-renders
 * - Improved error handling
 */
export default function UserPools() {
    const { login } = useAuth()
    const { pools, metadata, isError, isEmpty, hasData, showSkeleton, ready, authenticated, refetch } = useUserPools()

    // Memoize callbacks to prevent unnecessary re-renders
    const handleRetry = useCallback(() => {
        void refetch().catch(console.error)
    }, [refetch])

    // Enhanced development logging (only when verbose logging is enabled)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_VERBOSE_LOGS === 'true') {
        // Only log significant state changes, not every render
        const componentLogKey = `${showSkeleton}-${hasData}-${isEmpty}-${isError}`
        if (!globalThis.__lastUserPoolComponentLogKey || globalThis.__lastUserPoolComponentLogKey !== componentLogKey) {
            if (showSkeleton) {
                console.log('[NextUserPoolV2] ⏳ Loading state')
            } else if (hasData) {
                console.log('[NextUserPoolV2] ✅ Data loaded:', {
                    poolsCount: pools.length,
                    metadata,
                })
            } else if (isEmpty) {
                console.log('[NextUserPoolV2] 📭 No pools found')
            } else if (isError) {
                console.error('[NextUserPoolV2] ❌ Error state')
            }
            globalThis.__lastUserPoolComponentLogKey = componentLogKey
        }
    }

    const renderPoolCard = useCallback(
        (pool: (typeof pools)[0]) => (
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
        ),
        [],
    )

    const renderContent = useMemo(() => {
        // Privy not ready or loading state
        if (showSkeleton) {
            return <UserPoolsSkeleton />
        }

        // User not authenticated
        if (!authenticated) {
            return (
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
            )
        }

        // Error state with retry
        if (isError) {
            return (
                <motion.div
                    className='flex h-24 items-center justify-center rounded-3xl bg-white p-4'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    <div className='flex flex-col items-center gap-2 text-center'>
                        <h2 className='text-sm font-semibold text-red-600'>Unable to load pools</h2>
                        <p className='text-xs text-gray-600'>Please check your connection and try again</p>
                        <button onClick={handleRetry} className='mt-1 text-xs text-[#4078F4] hover:underline'>
                            Retry
                        </button>
                    </div>
                </motion.div>
            )
        }

        // Authenticated user with pools
        if (hasData) {
            return <div className='flex flex-col space-y-2'>{pools.map(renderPoolCard)}</div>
        }

        // Authenticated user with no pools
        return (
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
        )
    }, [showSkeleton, authenticated, isError, hasData, pools, renderPoolCard, login, handleRetry])

    return (
        <div className='detail_card_bg rounded-[2rem] p-3 pt-[18px]'>
            <div className='flex shrink justify-between'>
                <h1 className='pl-[6px] text-lg font-semibold'>Your Pools</h1>
                {ready && authenticated && hasData && (
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
            <div className='mt-4'>{renderContent}</div>
        </div>
    )
}
