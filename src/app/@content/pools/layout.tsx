'use client'

import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { useEffect } from 'react'

export default function PoolsLayout({ yours, upcoming }: LayoutWithSlots<'yours' | 'upcoming'>) {
    const hideBar = useBottomBarStore(state => state.hideBar)

    useEffect(() => {
        console.log('PoolsLayout mounted')
        hideBar()
    }, [])

    return (
        <div className='flex min-h-dvh scroll-py-6 flex-col gap-6'>
            {yours}
            {upcoming}
        </div>
    )
}
