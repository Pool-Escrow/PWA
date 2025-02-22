'use client'

import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import SearchBar from '@/app/(pages)/pool/[pool-id]/participants/_components/searchBar'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import type { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { appActions, appStore$ } from '@/app/stores/app.store'
import { use$ } from '@legendapp/state/react'
import { LoaderIcon } from 'lucide-react'
import type { PanInfo } from 'motion/react'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'
import { useLayoutEffect, useMemo, useState } from 'react'
import type { MyPoolsTab } from './my-pools.tabs.config'
import { myPoolsTabsConfig } from './my-pools.tabs.config'
import TabContent from './tab-content'

interface MyPoolsTabsProps {
    initialLoad: boolean
    upcomingPools: PoolItem[]
    pastPools: PoolItem[]
}

const MyPoolsTabs: React.FC<MyPoolsTabsProps> = ({ initialLoad, upcomingPools, pastPools }) => {
    const currentTab = use$(appStore$.settings.myPoolsTab)
    const [direction, setDirection] = useState(1)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('all')

    // Memoize filtered pools
    const currentPools = useMemo(() => {
        let pools = currentTab === 'active' ? upcomingPools : pastPools
        if (selectedStatus !== 'all' && currentTab === 'active') {
            pools = pools.filter(pool => String(pool.status) === selectedStatus)
        }
        return pools.filter(pool => pool.name?.toLowerCase().includes(searchTerm?.toLowerCase()))
    }, [currentTab, searchTerm, selectedStatus, upcomingPools, pastPools])

    useLayoutEffect(() => {
        setIsClient(true)
    }, [])

    const handleTabChange = (newTab: string) => {
        if (!isAnimating && newTab !== currentTab) {
            const currentIndex = myPoolsTabsConfig.findIndex(tab => tab.id === currentTab)
            const newIndex = myPoolsTabsConfig.findIndex(tab => tab.id === newTab)
            setDirection(newIndex > currentIndex ? 1 : -1)
            setIsAnimating(true)
            appActions.setMyPoolsTab(newTab as MyPoolsTab['id'])
        }
    }

    const handleFilterValueChange = (value: string) => {
        setSelectedStatus(value)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleAnimationComplete = () => {
        setIsAnimating(false)
    }

    const handlePan = (event: PointerEvent, info: PanInfo) => {
        if (isAnimating) return

        const currentIndex = myPoolsTabsConfig.findIndex(tab => tab.id === currentTab)
        const threshold = 50 // Minimum displacement to change tab

        if (info.offset.x < -threshold && currentIndex < myPoolsTabsConfig.length - 1) {
            // Slider to the left
            handleTabChange(myPoolsTabsConfig[currentIndex + 1].id)
        } else if (info.offset.x > threshold && currentIndex > 0) {
            // Slider to the right
            handleTabChange(myPoolsTabsConfig[currentIndex - 1].id)
        }
    }

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
                        <TabsTrigger
                            className='relative'
                            key={id}
                            value={id}
                            onPointerDownCapture={e => e.stopPropagation()}>
                            {currentTab === id && (
                                <motion.div
                                    layoutId='tab-indicator'
                                    className='btn-cta absolute inset-0 h-full rounded-full mix-blend-multiply'
                                    transition={{
                                        type: 'spring',
                                        bounce: 0.2,
                                        duration: 0.4,
                                    }}
                                />
                            )}
                            <span
                                className={`z-10 w-full text-center text-base font-semibold ${
                                    currentTab === id ? 'text-white' : ''
                                }`}>
                                {name}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className='mt-4 space-y-2 px-4'>
                    <SearchBar query={searchTerm} onChange={handleSearchChange} />
                    {currentTab === 'active' && (
                        <Select value={selectedStatus} onValueChange={handleFilterValueChange}>
                            <SelectTrigger aria-label='statuses'>
                                <SelectValue placeholder='All Statuses' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value='all'>All Statuses</SelectItem>
                                    <SelectItem value={`${POOLSTATUS.STARTED}`}>Live</SelectItem>
                                    <SelectItem value={`${POOLSTATUS.DEPOSIT_ENABLED}`}>Registered</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            <motion.div className='relative mt-20 flex-1' onPan={handlePan} style={{ touchAction: 'pan-y' }}>
                <AnimatePresence mode='wait' initial={false} onExitComplete={handleAnimationComplete}>
                    {myPoolsTabsConfig.map(({ id }) => (
                        <TabContent
                            key={id}
                            tabId={id}
                            isActive={currentTab === id}
                            direction={direction}
                            initialLoad={initialLoad}
                            pools={currentPools}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>
        </Tabs>
    )
}

export default MyPoolsTabs
