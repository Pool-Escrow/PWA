'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { Button } from '@/app/_components/ui/button'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PaymentConfirmationDialogProps {
    isOpen: boolean
    onCloseAction: () => Promise<void>
    onConfirmAction: () => Promise<void>
    avatar: string
    displayName: string
    amount: string
    tokenSymbol: string
    isPending: boolean
}

export function PaymentConfirmationDialog({
    isOpen,
    onCloseAction,
    onConfirmAction,
    avatar,
    displayName,
    amount,
    tokenSymbol,
    isPending,
}: PaymentConfirmationDialogProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='fixed inset-0 bg-black/50' onClick={onCloseAction} />
            <div className='relative z-50 mx-4 flex w-full max-w-md flex-col items-center rounded-[28px] bg-white p-[8px] pt-[24px] text-center shadow-xl'>
                <Avatar className='mb-4 size-16 md:size-24' aria-label='User Avatar'>
                    <AvatarImage alt='User Avatar' src={avatar} />
                    <AvatarFallback className='bg-[#d9d9d9]' />
                </Avatar>

                <h2 className='mb-0 text-[16px] font-semibold'>You are about to pay {displayName}</h2>
                <p className='mb-6 text-[16px] font-semibold'>
                    {amount} {tokenSymbol}. Are you sure?
                </p>

                <div className='flex w-full gap-[6px]'>
                    <Button
                        onClick={onCloseAction}
                        className='h-[46px] flex-1 rounded-full bg-[#EEEFF0] text-base font-semibold text-[#787878] hover:bg-[#EEEFF0] active:bg-[#EEEFF0]'>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirmAction}
                        disabled={isPending}
                        className='h-[46px] flex-1 rounded-full bg-[#4078F4] text-base font-semibold text-white hover:bg-[#4078F4] active:bg-[#4078F4]'>
                        {isPending ? 'Processing...' : 'Pay'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    )
}
