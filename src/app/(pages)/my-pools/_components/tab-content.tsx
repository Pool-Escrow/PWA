import { TabsContent } from '@/components/ui/tabs'
import type { PoolItem } from '@/lib/entities/models/pool-item'
import { motion } from 'framer-motion'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import UserPoolList from './user-pool-list'

interface TabContentProps {
    tabId: string
    isActive: boolean
    direction: number
    initialLoad: boolean
    pools: PoolItem[]
}

const TabContent: React.FC<TabContentProps> = ({ tabId, isActive, direction, initialLoad, pools }) => {
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isActive && contentRef.current) {
            contentRef.current.scrollTo(0, 0)
        }
    }, [isActive])

    return (
        <motion.div
            layoutId='active-tab-content'
            layoutDependency={tabId}
            initial={initialLoad ? false : { x: 300 * direction, opacity: 0 }}
            animate={isActive ? { x: 0, opacity: 1 } : { x: -300 * direction, opacity: 0 }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className={`absolute inset-0 overflow-y-auto ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
            ref={contentRef}>
            <TabsContent value={tabId} forceMount>
                <UserPoolList pools={pools} name={tabId as 'upcoming' | 'past'} />
            </TabsContent>
        </motion.div>
    )
}

export default TabContent
