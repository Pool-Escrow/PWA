'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/pwa/_components/ui/tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { LoaderIcon } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import PoolList from '../../pools/_components/pool-list'
import { myPoolsTabsConfig, type MyPoolsTab } from './my-pools.tabs.config'

interface MyPoolsTabsProps {
    currentTab: MyPoolsTab['id']
    onChangeTab: (tabId: string) => void
    initialLoad: boolean
}

const MyPoolsTabs: React.FC<MyPoolsTabsProps> = ({ currentTab, onChangeTab, initialLoad }) => {
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

    if (!isClient) {
        return (
            <div className='flex h-full items-center justify-center'>
                <LoaderIcon className='animate-spin' />
            </div>
        )
    }

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange}>
            <div className='fixed inset-x-0 top-24 z-10 m-auto w-[calc(100%-2rem)] bg-white py-3'>
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
                            <span className='z-10 w-full text-center text-base font-semibold'>{name}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <div className='relative top-16'>
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentTab}
                        custom={direction}
                        initial={initialLoad ? false : { x: 300 * direction, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300 * direction, opacity: 0 }}
                        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                        onAnimationComplete={handleAnimationComplete}
                        className='absolute w-full'>
                        <TabsContent value={currentTab} forceMount>
                            <PoolList pools={[]} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </div>
        </Tabs>
    )
}

export default MyPoolsTabs
