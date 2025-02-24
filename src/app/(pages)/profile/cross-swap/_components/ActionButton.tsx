'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ActionButtonProps {
    isApproved: boolean
    onApproveAction: () => void
    onSwapAction: () => void
    disabled?: boolean
}

export function ActionButton({ isApproved, onApproveAction, onSwapAction, disabled }: ActionButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleAction = () => {
        setIsLoading(true)
        try {
            if (isApproved) {
                onSwapAction()
            } else {
                onApproveAction()
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
            toast.error(errorMessage, {
                description: 'Please try again or contact support if the issue persists.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='fixed inset-x-0 bottom-0 bg-white p-4'>
            <div className='mx-auto max-w-md'>
                <button
                    onClick={handleAction}
                    disabled={disabled || isLoading}
                    // eslint-disable-next-line tailwindcss/no-custom-classname
                    className='btn-cta h-[46px] w-full rounded-[2rem] bg-blue-500 px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-md hover:bg-blue-600 active:shadow-lg disabled:opacity-50'>
                    {isLoading ? (
                        <span className='flex items-center justify-center'>
                            <svg
                                className='-ml-1 mr-3 size-5 animate-spin text-white'
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'>
                                <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                />
                                <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                />
                            </svg>
                            {isApproved ? 'Bridging...' : 'Approving...'}
                        </span>
                    ) : isApproved ? (
                        'Bridge'
                    ) : (
                        'Approve'
                    )}
                </button>
            </div>
        </div>
    )
}
