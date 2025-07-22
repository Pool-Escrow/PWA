'use client'

import { Button } from '@/components/ui/button'
import { useDebugStore } from '@/stores/debug.store'
import { useDeveloperFeaturesVisible, useDeveloperStore } from '@/stores/developer.store'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function DebugOverlay() {
    const isDeveloperMode = useDeveloperFeaturesVisible()
    const { settings } = useDeveloperStore()
    const {
        requestCounters,
        totalRequests,
        renderCount,
        showDebugOverlay,
        debugPosition,
        toggleDebugOverlay,
        setDebugPosition,
        resetCounters,
    } = useDebugStore()

    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const overlayRef = useRef<HTMLDivElement>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!overlayRef.current) return

        const rect = overlayRef.current.getBoundingClientRect()
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
        setIsDragging(true)
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            setDebugPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            })
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragOffset, setDebugPosition])

    // Convert Map to Array for rendering
    const requestCountersArray = Array.from(requestCounters.entries()).map(([key, counter]) => ({
        key,
        ...counter,
    }))

    // Group by component
    const groupedCounters = requestCountersArray.reduce(
        (acc, counter) => {
            if (!acc[counter.component]) {
                acc[counter.component] = []
            }
            acc[counter.component].push(counter)
            return acc
        },
        {} as Record<string, typeof requestCountersArray>,
    )

    // Only show when developer mode is enabled AND debug overlay setting is true
    if (!isDeveloperMode || !settings.showDebugOverlay) return null

    return (
        <>
            {/* Floating toggle button */}
            <motion.div
                className='fixed bottom-20 right-4 z-50'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}>
                <Button
                    onClick={toggleDebugOverlay}
                    size='icon'
                    variant='outline'
                    className='size-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600'>
                    <Activity className='size-5' />
                </Button>
            </motion.div>

            {/* Debug overlay panel */}
            <AnimatePresence>
                {showDebugOverlay && (
                    <motion.div
                        ref={overlayRef}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='fixed z-50 max-h-96 w-80 overflow-hidden rounded-lg bg-black/90 text-white shadow-2xl backdrop-blur-sm'
                        style={{
                            left: debugPosition.x,
                            top: debugPosition.y,
                            cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                        onMouseDown={handleMouseDown}>
                        {/* Header */}
                        <div className='flex items-center justify-between bg-blue-600 p-3'>
                            <div className='flex items-center gap-2'>
                                <Activity className='size-4' />
                                <h3 className='font-semibold'>Debug Monitor</h3>
                            </div>
                            <div className='flex items-center gap-1'>
                                <Button
                                    onClick={resetCounters}
                                    size='icon'
                                    variant='ghost'
                                    className='size-6 text-white hover:bg-white/20'>
                                    <RotateCcw className='size-3' />
                                </Button>
                                <Button
                                    onClick={toggleDebugOverlay}
                                    size='icon'
                                    variant='ghost'
                                    className='size-6 text-white hover:bg-white/20'>
                                    <X className='size-3' />
                                </Button>
                            </div>
                        </div>

                        {/* Stats summary */}
                        <div className='border-b border-gray-700 p-3'>
                            <div className='grid grid-cols-2 gap-2 text-xs'>
                                <div>
                                    <span className='text-gray-400'>Total Requests:</span>
                                    <span className='ml-1 font-mono font-bold text-red-400'>{totalRequests}</span>
                                </div>
                                <div>
                                    <span className='text-gray-400'>Renders:</span>
                                    <span className='ml-1 font-mono font-bold text-yellow-400'>{renderCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Request details */}
                        <div className='max-h-64 overflow-y-auto p-3'>
                            {Object.keys(groupedCounters).length === 0 ? (
                                <p className='text-center text-xs text-gray-400'>No requests tracked yet</p>
                            ) : (
                                <div className='space-y-3'>
                                    {Object.entries(groupedCounters).map(([component, counters]) => {
                                        const totalForComponent = counters.reduce((sum, c) => sum + c.count, 0)
                                        return (
                                            <div key={component} className='space-y-1'>
                                                <div className='flex items-center justify-between'>
                                                    <h4 className='text-xs font-semibold text-blue-300'>{component}</h4>
                                                    <span className='font-mono text-xs text-red-400'>
                                                        {totalForComponent}
                                                    </span>
                                                </div>
                                                <div className='ml-2 space-y-1'>
                                                    {counters.map(counter => (
                                                        <div
                                                            key={counter.key}
                                                            className='flex items-center justify-between text-xs'>
                                                            <span className='text-gray-300'>
                                                                {counter.type}
                                                                {counter.token && ` (${counter.token})`}
                                                            </span>
                                                            <span className='font-mono text-yellow-400'>
                                                                {counter.count}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Warning if too many requests */}
                        {totalRequests > 50 && (
                            <div className='border-t border-red-500 bg-red-600/20 p-2 text-center'>
                                <p className='text-xs text-red-300'>⚠️ High request count detected!</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
