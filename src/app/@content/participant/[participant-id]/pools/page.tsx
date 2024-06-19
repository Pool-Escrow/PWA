'use client'

import PoolList from '@/components/pools/pool-list/pool-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

interface Tab {
    id: 'upcoming' | 'past'
    name: 'Upcoming' | 'Past'
}

type TabConfig = Tab[]

const tabConfig: TabConfig = [
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'past', name: 'Past' },
]

export default function ParticipantPoolsPage() {
    const searchParams = useSearchParams()
    const currentTab = (searchParams?.get('tab') as Tab['id']) || tabConfig[0].id
    const currentTabIndex = tabConfig.findIndex(({ id }) => id === currentTab) || 0

    function changeTab(tabId: string) {
        const params = new URLSearchParams(searchParams?.toString())
        params.set('tab', tabId)
        window.history.replaceState(null, '', `?${params.toString()}`)
    }

    return (
        <Tabs defaultValue={currentTab} className='flex-1'>
            <TabsList>
                {tabConfig.map(({ name, id }) => (
                    <TabsTrigger className='relative' key={id} onClick={() => changeTab(id)} value={id}>
                        {currentTab === id && (
                            <motion.div
                                layoutId='bubble'
                                className='absolute inset-0 z-10 h-full rounded-full bg-cta mix-blend-multiply'
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                            />
                        )}
                        {/* TODO: Also animate text color as to prevent flash */}
                        <span className='z-20 w-full text-center text-base font-semibold'>{name}</span>
                    </TabsTrigger>
                ))}
            </TabsList>
            <AnimatePresence custom={currentTab}>
                <TabsContent key={currentTab} value={currentTab} asChild>
                    <motion.div
                        initial={{ x: currentTabIndex ? -300 : 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: currentTabIndex ? -300 : 300, opacity: 0 }}>
                        <PoolList filter={{ status: currentTab }} />
                    </motion.div>
                </TabsContent>
            </AnimatePresence>
        </Tabs>
    )
}
