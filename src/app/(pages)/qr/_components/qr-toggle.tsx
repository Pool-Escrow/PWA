'use client'

import { cn } from '@/lib/utils/tailwind'
import { useState } from 'react'

type QRToggleProps = {
    onToggle?: (mode: 'scan' | 'pay') => void
}

export default function QRToggle({ onToggle }: QRToggleProps) {
    const [mode, setMode] = useState<'scan' | 'pay'>('scan')

    const handleToggle = (newMode: 'scan' | 'pay') => {
        console.log('Toggle clicked - Switching to:', newMode)
        setMode(newMode)
        onToggle?.(newMode)
    }

    return (
        <div className='mx-auto flex h-[54px] w-[345px] items-center rounded-[42px] bg-[#eeeeee] p-1.5 backdrop-blur-sm'>
            <button
                onClick={() => handleToggle('scan')}
                className={cn(
                    'flex h-[42px] flex-1 items-center justify-center rounded-[32px] transition-all duration-200',
                    mode === 'scan' ? 'bg-white' : 'hover:bg-white/10',
                )}>
                <span
                    className={cn(
                        'text-base font-semibold leading-normal',
                        mode === 'scan' ? 'text-black' : 'text-[#6b6e76]',
                    )}>
                    Scan QR
                </span>
            </button>
            <button
                onClick={() => handleToggle('pay')}
                className={cn(
                    'flex h-[42px] flex-1 items-center justify-center rounded-[32px] transition-all duration-200',
                    mode === 'pay' ? 'bg-white' : 'hover:bg-white/10',
                )}>
                <span
                    className={cn(
                        'text-base font-semibold leading-normal',
                        mode === 'pay' ? 'text-black' : 'text-[#6b6e76]',
                    )}>
                    Pay Me
                </span>
            </button>
        </div>
    )
}
