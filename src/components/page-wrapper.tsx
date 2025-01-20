'use client'

import TopBar, { TopBarProps } from './top-bar'

type PageWrapperProps = {
    children: React.ReactNode
    topBarProps?: TopBarProps
    fullScreen?: boolean
}

export default function PageWrapper({ children, topBarProps, fullScreen }: PageWrapperProps) {
    if (fullScreen) {
        return <>{children}</>
    }

    return (
        <div className='flex flex-1 flex-col'>
            {topBarProps && <TopBar {...topBarProps} />}
            <div className='relative flex-1'>
                <div className='absolute inset-0 overflow-y-auto'>{children}</div>
            </div>
        </div>
    )
}
