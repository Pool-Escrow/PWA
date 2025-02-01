'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { LoaderIcon } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import PoolList from '../../pools/_components/pool-list'
import { myPoolsTabsConfig, type MyPoolsTab } from './my-pools.tabs.config'
import type { PoolItem } from '@/app/_lib/entities/models/pool-item'

interface MyPoolsTabsProps {
    currentTab: MyPoolsTab['id']
    onChangeTab: (tabId: string) => void
    initialLoad: boolean
    upcomingPools: PoolItem[]
    pastPools: PoolItem[]
}

const MyPoolsTabs: React.FC<MyPoolsTabsProps> = ({
    currentTab,
    onChangeTab,
    initialLoad,
    upcomingPools,
    pastPools,
}) => {
    const [direction, setDirection] = useState(1)
    const [isAnimating, setIsAnimating] = useState(false)
    const prevTabRef = useRef(currentTab)
    const [isClient, setIsClient] = useState(false)

    useLayoutEffect(() => {
        setIsClient(true)
    }, [])

    useLayoutEffect(() => {
        if (!initialLoad && currentTab !== prevTabRef.current) {
            const currentIndex = myPoolsTabsConfig.findIndex(tab => tab.id === prevTabRef.current)
            const newIndex = myPoolsTabsConfig.findIndex(tab => tab.id === currentTab)
            setDirection(newIndex > currentIndex ? -1 : 1)
            setIsAnimating(true)
        }
        prevTabRef.current = currentTab
    }, [currentTab, initialLoad])

    const handleTabChange = (newTab: string) => {
        if (!isAnimating && newTab !== currentTab) {
            onChangeTab(newTab)
        }
    }

    const handleAnimationComplete = () => {
        setIsAnimating(false)
    }

    const handleSwipe = (direction: 'LEFT' | 'RIGHT') => {
        if (isAnimating) return

        const currentIndex = myPoolsTabsConfig.findIndex(tab => tab.id === currentTab)
        let newIndex = currentIndex

        if (direction === 'LEFT' && currentIndex < myPoolsTabsConfig.length - 1) {
            newIndex = currentIndex + 1
        } else if (direction === 'RIGHT' && currentIndex > 0) {
            newIndex = currentIndex - 1
        }

        if (newIndex !== currentIndex) {
            onChangeTab(myPoolsTabsConfig[newIndex].id)
        }
    }

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => handleSwipe('LEFT'),
        onSwipedRight: () => handleSwipe('RIGHT'),
        trackMouse: true,
    })

    if (!isClient) {
        return (
            <div className='flex flex-1 items-center justify-center'>
                <LoaderIcon className='animate-spin' />
            </div>
        )
    }

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className='flex flex-1'>
            <div className='fixed inset-x-0 z-10 m-auto w-[calc(100%-2rem)] bg-white py-3'>
                <TabsList>
                    {myPoolsTabsConfig.map(({ name, id }) => (
                        <TabsTrigger className='relative' key={id} value={id}>
                            {currentTab === id && (
                                <motion.div
                                    layoutId='active-tab-indicator'
                                    className='absolute inset-0 h-full rounded-full bg-cta mix-blend-multiply'
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span
                                className={`z-10 w-full text-center text-base font-semibold ${currentTab === id ? 'text-white' : ''}`}>
                                {name}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <div className='relative mt-32 flex-1' {...swipeHandlers}>
                <AnimatePresence mode='popLayout' initial={false} custom={direction}>
                    <motion.div
                        key={currentTab}
                        custom={direction}
                        initial={{ x: 300 * direction, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300 * direction, opacity: 0 }}
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                        onAnimationComplete={handleAnimationComplete}
                        className='absolute w-full'>
                        <TabsContent value={currentTab}>
                            <PoolList pools={currentTab === 'upcoming' ? upcomingPools : pastPools} name={currentTab} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </div>
        </Tabs>
    )
}

export default MyPoolsTabs
