'use client'

import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { LoaderIcon } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'
import { AnimatePresence, motion } from 'framer-motion'
import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select';
import SearchBar from '@/app/(pages)/pool/[pool-id]/participants/_components/searchBar'
import { PoolItem } from '@/app/_lib/entities/models/pool-item'
import PoolList from '../../pools/_components/pool-list'
import { myPoolsTabsConfig, type MyPoolsTab } from './my-pools.tabs.config'

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
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPools, setCurrentPools] = useState([] as PoolItem[])
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        console.log('changed')
        let pools = currentTab === 'active' ? upcomingPools : pastPools;
        if (selectedStatus !== 'all' && currentTab === 'active') {
            pools = pools.filter((pool) => String(pool.status) === selectedStatus)
        }
        setCurrentPools(pools.filter((pool) => pool.name?.toLowerCase().includes(searchTerm?.toLowerCase())))
    }, [currentTab, searchTerm, selectedStatus])


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

    const handleFilterValueChange = (value: string) => {
        setSelectedStatus(value);
    };

    const handleTabChange = (newTab: string) => {
        console.log({newTab})
        console.log({currentTab})
        console.log({isAnimating})
        if (!isAnimating && newTab !== currentTab) {
            onChangeTab(newTab)
        }
    }

    const handleAnimationComplete = () => {
        console.log('complete')
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
    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(e.target.value)
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
                            <span className='z-10 w-full text-center text-base font-semibold'>{name}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <div className='relative mt-20 flex-1' {...swipeHandlers}>
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
                            <div>
                                <div className='pb-8'>
                                <SearchBar query={searchTerm} onChange={handleSearchChange} />
                                    {currentTab === 'active'  && ( 
                                        <Select value={selectedStatus} onValueChange={handleFilterValueChange}>
                                            <SelectTrigger aria-label="statuses">
                                                <SelectValue placeholder="All Statuses" />
                                            </SelectTrigger>
                                                <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="all">All Statuses</SelectItem>
                                                            <SelectItem value={`${POOLSTATUS.STARTED}`}>Live</SelectItem>
                                                            <SelectItem value={`${POOLSTATUS.DEPOSIT_ENABLED}`}>Registered</SelectItem>
                                                        </SelectGroup>
                                                </SelectContent>
                                        </Select>
                                    )}
                                    </div>
                            <PoolList pools={currentPools} name={currentTab} />
                            </div>
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </div>
        </Tabs>
    )
}

export default MyPoolsTabs

