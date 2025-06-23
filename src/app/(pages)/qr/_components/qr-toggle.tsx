'use client'

import { Button } from '@/components/ui/button'
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

    const ToggleButton = ({ buttonMode, label }: { buttonMode: 'scan' | 'pay'; label: string }) => (
        <Button
            onClick={() => handleToggle(buttonMode)}
            className={cn(
                'flex h-[42px] flex-1 items-center justify-center rounded-[32px] transition-all duration-200',
                mode === buttonMode
                    ? 'bg-white hover:bg-white focus:bg-white'
                    : 'bg-[#eeeeee] hover:bg-white/10 focus:bg-[#eeeeee]',
            )}>
            <span
                className={cn(
                    'text-base font-semibold leading-normal',
                    mode === buttonMode ? 'text-black' : 'text-[#6b6e76]',
                )}>
                {label}
            </span>
        </Button>
    )

    return (
        <div className='mx-auto flex h-[54px] w-[345px] items-center rounded-[42px] bg-[#eeeeee] p-1.5 backdrop-blur-sm'>
            <ToggleButton buttonMode='scan' label='Scan QR' />
            <ToggleButton buttonMode='pay' label='Pay Me' />
        </div>
    )
}
