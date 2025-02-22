'use client'

import { useTokenDecimals } from '@/app/(pages)/profile/send/_components/use-token-decimals'
import { useTransferToken } from '@/app/(pages)/profile/send/_components/use-transfer-tokens'
import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { cn } from '@/lib/utils/tailwind'
import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { parseUnits } from 'viem'
import { PaymentConfirmationDialog } from './_components/payment-confirmation-dialog'
import TokenSelector from './_components/token-selector'
import { dropTokenAddress } from '@/types/contracts'

interface PayOtherPlayerFormProps {
    recipientAddress: Address
    avatar: string
    displayName: string
}

const PayOtherPlayerForm: React.FC<PayOtherPlayerFormProps> = ({ recipientAddress, avatar, displayName }) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputValue, setInputValue] = useState<string>('')
    const [selectedTokenAddress, setSelectedTokenAddress] = useState<Address>(dropTokenAddress[8453])

    const [showConfirmation, setShowConfirmation] = useState(false)
    const { transferToken, isConfirming, isSuccess, setIsSuccess } = useTransferToken(selectedTokenAddress)
    const { tokenDecimalsData } = useTokenDecimals(selectedTokenAddress)

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    const handlePayButtonClick = () => {
        setIsSuccess(false)
        setShowConfirmation(true)
    }

    useEffect(() => {
        if (isSuccess) {
            setShowConfirmation(false)
            setInputValue('')
            toast.success('Payment sent successfully!')
        }
    }, [isSuccess])

    const handleConfirmPayment = () => {
        if (!inputValue || !tokenDecimalsData?.tokenDecimals) {
            toast.error('Invalid amount')
            setShowConfirmation(false)
            return
        }

        try {
            const amount = parseUnits(inputValue, tokenDecimalsData.tokenDecimals)
            void transferToken(recipientAddress, amount)
        } catch (error) {
            console.error('Payment failed:', error)
            toast.error('Payment failed. Please try again.')
            setShowConfirmation(false)
        }
    }

    const clearInput = () => {
        setInputValue('')
        inputRef.current?.focus()
    }

    const handleTokenSelect = (address: Address) => {
        setSelectedTokenAddress(address)
    }

    const handleMaxClick = (amount: string) => {
        setInputValue(amount)
    }

    return (
        <>
            <div className='flex h-16 w-full flex-row justify-center'>
                <div className='relative flex w-full justify-center pt-3'>
                    <div className='relative inline-flex items-center'>
                        <span className='absolute top-0 text-[20px] text-black'>$</span>
                        <div className='relative'>
                            <Input
                                className={cn(
                                    'h-24 border-none bg-transparent text-center text-6xl font-bold focus:outline-none focus:ring-0',
                                    inputValue === '' ? 'text-gray-300' : 'text-black',
                                )}
                                placeholder='0'
                                autoFocus={true}
                                value={inputValue}
                                type='number'
                                onChange={handleInputChange}
                                ref={inputRef}
                                inputMode='numeric'
                                style={{
                                    width: `calc(${Math.max(2, inputValue.length || 1)}ch + 24px)`,
                                    textAlign: 'center',
                                    caretColor: 'transparent',
                                    padding: '0 12px',
                                }}
                            />
                            <div
                                className={cn(
                                    'animate-caret absolute top-1/2 h-12 w-[1px] -translate-y-1/2 bg-black pt-4',
                                    inputValue === '' ? 'left-[76px]' : 'left-full -ml-2',
                                )}
                                style={{
                                    animation: 'caret-blink 1.5s step-end infinite',
                                }}
                            />
                        </div>
                        {inputValue && (
                            <button onClick={clearInput} className='absolute -right-4 top-4 -translate-y-1/2'>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='18'
                                    height='18'
                                    viewBox='0 0 14 14'
                                    fill='none'>
                                    <rect width='14' height='14' rx='7' fill='#757E85' />
                                    <path
                                        d='M7.0014 6.1751L9.8889 3.2876L10.7137 4.11243L7.82623 6.99993L10.7137 9.88743L9.8889 10.7123L7.0014 7.82476L4.1139 10.7123L3.28906 9.88743L6.17656 6.99993L3.28906 4.11243L4.1139 3.2876L7.0014 6.1751Z'
                                        fill='white'
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className='fixed inset-x-0 bottom-0 flex w-full flex-col items-center justify-center space-y-2 bg-white px-6 pb-4'>
                <TokenSelector onTokenSelect={handleTokenSelect} onMaxClick={handleMaxClick} />
                <Button
                    disabled={inputValue === ''}
                    onClick={handlePayButtonClick}
                    className='bg-cta active:bg-cta-active mb-3 h-[46px] w-full flex-1 grow flex-row items-center justify-center rounded-[2rem] py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    Pay
                </Button>
            </div>
            <PaymentConfirmationDialog
                isOpen={showConfirmation}
                onCloseAction={() => setShowConfirmation(false)}
                onConfirmAction={handleConfirmPayment}
                avatar={avatar}
                displayName={displayName}
                amount={inputValue}
                tokenSymbol={selectedTokenAddress === currentTokenAddress ? 'USDC' : 'DROP'}
                isPending={isConfirming}
            />
            <style jsx>{`
                @keyframes caret-blink {
                    from,
                    to {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    )
}

export default PayOtherPlayerForm
