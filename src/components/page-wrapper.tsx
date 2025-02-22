'use client'

import type { TopBarProps } from './top-bar'
import TopBar from './top-bar'

type PageWrapperProps = {
    children: React.ReactNode
    topBarProps?: TopBarProps
    fullScreen?: boolean
}

export default function PageWrapper({ children, topBarProps, fullScreen }: PageWrapperProps) {
    // Do not render the wrapper for modal routes
    const isModal = typeof window !== 'undefined' && window.location.pathname.includes('@modal')

    if (fullScreen || isModal) {
        return <>{children}</>
    }

    return (
        <div className='flex flex-1 flex-col'>
            {topBarProps && <TopBar {...topBarProps} />}
            <div className='relative flex-1'>
                <div className='absolute inset-0 overflow-visible'>{children}</div>
            </div>
        </div>
    )
}
