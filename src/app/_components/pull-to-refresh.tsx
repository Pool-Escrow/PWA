'use client'

import { useQueryClient } from '@tanstack/react-query'
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface PullToRefreshProps {
    keysToRefetch: string[] // Array of tanstack query keys to refetch
    children: React.ReactNode
    className?: string
}

// Define constants for the animation values
const START_ROTATION = 0
const END_ROTATION = 360
const START_SCALE = 0.6
const END_SCALE = 1
const START_OPACITY = 0
const MID_OPACITY = 0.5
const END_OPACITY = 1
const PULL_THRESHOLD = 80
const PULL_INDICATOR_SHOW = 20
const LOADING_HEIGHT = 40 // Height to maintain while loading

export default function PullToRefresh({ keysToRefetch, children, className = '' }: PullToRefreshProps) {
    const [isLoading, setIsLoading] = useState(false)
    const queryClient = useQueryClient()
    const y = useMotionValue(0)
    const controls = useAnimation()

    const touchStartY = useRef(0)
    const scrollStartY = useRef(0)

    const pullProgress = useTransform(y, [0, PULL_THRESHOLD], [0, 1])
    const rotate = useTransform(pullProgress, [0, 1], [START_ROTATION, END_ROTATION])
    const scale = useTransform(pullProgress, [0, 1], [START_SCALE, END_SCALE])
    const opacity = useTransform(y, [0, PULL_INDICATOR_SHOW, PULL_THRESHOLD], [START_OPACITY, MID_OPACITY, END_OPACITY])

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (isLoading) return
            const target = e.target as HTMLElement
            const scrollElement = target.closest('.overflow-y-auto')
            if (!scrollElement) return

            touchStartY.current = e.touches[0].clientY
            scrollStartY.current = scrollElement.scrollTop
        },
        [isLoading],
    )

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (isLoading) return
            const target = e.target as HTMLElement
            const scrollElement = target.closest('.overflow-y-auto')
            if (!scrollElement) return

            const touchY = e.touches[0].clientY
            const deltaY = touchY - touchStartY.current

            // Only handle pull-to-refresh when at the top
            if (scrollElement.scrollTop === 0 && deltaY > 0) {
                y.set(deltaY * 0.4) // More resistance for smoother feel
                e.preventDefault()
            } else {
                y.set(0)
            }
        },
        [isLoading, touchStartY, y],
    )

    const handleTouchEnd = useCallback(() => {
        if (isLoading) return
        const currentY = y.get()

        if (currentY > PULL_THRESHOLD) {
            // Animate to loading state
            void controls.start({
                y: LOADING_HEIGHT,
                transition: {
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.4,
                },
            })

            setIsLoading(true)

            Promise.all(keysToRefetch.map(key => queryClient.refetchQueries({ queryKey: [key] })))
                .then(() => {
                    console.log('✅ All data refreshed')
                })
                .catch(error => {
                    console.error('Failed to refresh:', error)
                })
                .finally(() => {
                    // Animate back to start after loading
                    void controls.start({
                        y: 0,
                        transition: {
                            type: 'spring',
                            bounce: 0.2,
                            duration: 0.4,
                            delay: 0.2, // Small delay to show completion
                        },
                    })
                    setIsLoading(false)
                })
        } else {
            // Spring back if not triggered
            void controls.start({
                y: 0,
                transition: {
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.4,
                },
            })
        }
    }, [isLoading, y, controls, keysToRefetch, queryClient])

    useEffect(() => {
        document.addEventListener('touchstart', handleTouchStart, { passive: true })
        document.addEventListener('touchmove', handleTouchMove, { passive: false })
        document.addEventListener('touchend', handleTouchEnd)

        return () => {
            document.removeEventListener('touchstart', handleTouchStart)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    return (
        <div className={`relative size-full ${className}`}>
            {/* Loading indicator */}
            <motion.div
                style={{ opacity }}
                className='pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center'>
                {isLoading ? (
                    <div className='relative size-7'>
                        <div className='absolute size-full animate-spin rounded-full border-[3px] border-primary/20 border-t-primary' />
                    </div>
                ) : (
                    <motion.div
                        style={{ rotate, scale }}
                        className='flex size-7 items-center justify-center text-primary'>
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

            {/* Content wrapper */}
            <motion.div
                style={{ y }}
                animate={controls}
                className='size-full'
                transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.4,
                }}>
                {children}
            </motion.div>
        </div>
    )
}
