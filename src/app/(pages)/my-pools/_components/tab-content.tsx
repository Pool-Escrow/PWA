'use client'

import { TabsContent } from '@/app/_components/ui/tabs'
import type { PoolItem } from '@/app/_lib/entities/models/pool-item'
import { motion } from 'motion/react'
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
            layoutId={`tab-content-${tabId}`}
            initial={
                initialLoad
                    ? false
                    : {
                          x: direction * 100,
                          opacity: 0,
                      }
            }
            animate={
                isActive
                    ? {
                          x: 0,
                          opacity: 1,
                      }
                    : {
                          x: -direction * 100,
                          opacity: 0,
                      }
            }
            transition={{
                type: 'spring',
                bounce: 0.15,
                duration: 0.35,
            }}
            className={`absolute inset-0 overflow-y-auto ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`}
            ref={contentRef}>
            <TabsContent value={tabId} forceMount>
                <UserPoolList pools={pools} name={tabId as 'upcoming' | 'past'} />
            </TabsContent>
        </motion.div>
    )
}

export default TabContent
