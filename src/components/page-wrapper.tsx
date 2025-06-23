'use client'

import { Suspense } from 'react'
import type { TopBarProps } from './top-bar'
import TopBar from './top-bar'

type PageWrapperProps = {
    children: React.ReactNode
    topBarProps?: TopBarProps
    fullScreen?: boolean
}

// Loading fallback component
function PageLoadingFallback() {
    return (
        <div className='flex flex-1 items-center justify-center'>
            <div className='size-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
        </div>
    )
}

export default function PageWrapper({ children, topBarProps, fullScreen }: PageWrapperProps) {
    if (fullScreen) {
        return <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
    }

    return (
        <div className='flex flex-1 flex-col'>
            {topBarProps && <TopBar {...topBarProps} />}
            <div className='relative flex-1'>
                <div className='absolute inset-0 overflow-visible'>
                    <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
                </div>
            </div>
        </div>
    )
}
