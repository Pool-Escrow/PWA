'use client'

import BackCircleButton from '@/components/back-circle-button'
import { cn } from '@/lib/utils/tailwind' // Add this import
import React from 'react'

type ScannerPageLayoutProps = {
    children: React.ReactNode
    title: string
    className?: string
}

export default function ScannerPageLayout({ children, title, className }: ScannerPageLayoutProps) {
    return (
        <div className={'absolute left-0 top-0 flex h-full w-full'}>
            {children}
            <header className={cn('absolute top-4 w-full text-white', className)}>
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
