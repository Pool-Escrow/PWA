import PoolList from '@/components/pools/pool-list/pool-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
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

    useEffect(() => {
        if (!initialLoad && currentTab !== prevTabRef.current) {
            const currentIndex = myPoolsTabsConfig.findIndex(tab => tab.id === prevTabRef.current)
            const newIndex = myPoolsTabsConfig.findIndex(tab => tab.id === currentTab)
            setDirection(newIndex > currentIndex ? 1 : -1)
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

    return (
        <Tabs value={currentTab} onValueChange={handleTabChange} className='flex-1'>
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
            <div className='relative overflow-hidden' style={{ height: '300px' }}>
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
                            <PoolList filter={{ status: currentTab }} />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </div>
        </Tabs>
    )
}

export default MyPoolsTabs
