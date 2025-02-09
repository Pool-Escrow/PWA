'use client'

import type { TopBarProps } from './top-bar';
import TopBar from './top-bar'

type PageWrapperProps = {
    children: React.ReactNode
    topBarProps?: TopBarProps
}

export default function PageWrapper({ children, topBarProps }: PageWrapperProps) {
    return (
        <div className='flex flex-1 flex-col'>
            {topBarProps && <TopBar {...topBarProps} />}
            <div className='relative flex-1'>
                <div className='absolute inset-0 overflow-y-auto'>{children}</div>
            </div>
        </div>
    )
}
