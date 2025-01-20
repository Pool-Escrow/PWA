'use client'

import React from 'react'
import BackCircleButton from '@/components/back-circle-button'

type ScannerPageLayoutProps = {
    children: React.ReactNode
    title: string
}

export default function ScannerPageLayout({ children, title }: ScannerPageLayoutProps) {
    return (
        <div className='absolute left-0 top-0 flex h-full w-full'>
            {children}
            <header className='absolute top-4 w-full text-white'>
                <nav className='grid h-24 grid-cols-[1fr_auto_1fr] items-center'>
                    <div className='ml-6 w-6'>
                        <BackCircleButton />
                    </div>
                    <div className='text-center'>
                        <div className='w-full text-center text-sm font-semibold'>{title}</div>
                    </div>
                    <div className='justify-self-end'></div>
                </nav>
            </header>
        </div>
    )
}
