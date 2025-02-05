'use client'

import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
    className?: string
}

export default function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
    const y = useMotionValue(0)
    const controls = useAnimation()
    const [isLoading, setIsLoading] = useState(false)

    // Adjust thresholds for smoother feel
    const PULL_THRESHOLD = 80 // Reduced from 100 for easier activation
    const PULL_INDICATOR_SHOW = 20 // Show indicator earlier

    const pullProgress = useTransform(y, [0, PULL_THRESHOLD], [0, 1])
    const rotate = useTransform(pullProgress, [0, 1], [0, 360])
    const scale = useTransform(pullProgress, [0, 1], [0.6, 1])
    const opacity = useTransform(y, [0, PULL_INDICATOR_SHOW, PULL_THRESHOLD], [0, 0.5, 1])

    async function handleDragEnd() {
        if (y.get() > PULL_THRESHOLD) {
            console.log('Pull threshold reached, triggering refresh...')
            // Start returning to position immediately while loading
            controls.start({
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 40,
                },
            })
            setIsLoading(true)
            try {
                await onRefresh()
                console.log('Refresh completed successfully')
            } catch (error) {
                console.error('Refresh failed:', error)
            } finally {
                setIsLoading(false)
            }
        } else {
            // Smoother return animation when not triggering refresh
            controls.start({
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                },
            })
        }
    }

    async function handleDrag(_: any, info: PanInfo) {
        // Prevent further dragging while loading
        if (isLoading) {
            y.set(0)
            return
        }
    }

    useEffect(() => {
        controls.start({ y: 0 })
    }, [controls])

    return (
        <div className={`relative w-full ${className}`}>
            {/* Loading indicator */}
            <motion.div
                style={{ opacity }}
                className='pointer-events-none absolute left-0 right-0 top-2 flex justify-center'>
                {isLoading ? (
                    <div className='relative h-7 w-7'>
                        <div className='border-3 absolute h-full w-full animate-spin rounded-full border-primary/20 border-t-primary' />
                    </div>
                ) : (
                    <motion.div
                        style={{ rotate, scale }}
                        className='flex h-7 w-7 items-center justify-center text-primary'>
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                                d='M12 4V2M12 22v-2m-8-8H2m20 0h-2m-2.05-5.95l-1.414-1.414M7.464 16.536l-1.414 1.414m0-11.314l1.414 1.414m9.193 9.193l1.414 1.414'
                                stroke='currentColor'
                                strokeWidth='2.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                            />
                        </svg>
                    </motion.div>
                )}
            </motion.div>

            {/* Pull to refresh content */}
            <motion.div
                style={{ y }}
                drag='y'
                dragConstraints={{ top: 0, bottom: 120 }}
                dragElastic={0.6}
                onDragEnd={handleDragEnd}
                onDrag={handleDrag}
                animate={controls}
                className='w-full touch-pan-y'>
                {children}
            </motion.div>
        </div>
    )
}
