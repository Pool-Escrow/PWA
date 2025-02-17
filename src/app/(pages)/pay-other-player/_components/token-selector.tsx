'use client'

import { cn } from '@/lib/utils/tailwind'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Token {
    symbol: string
    icon: string
    balance: string
}

interface TokenSelectorProps {
    defaultToken?: string
    onTokenSelectAction: (token: string) => Promise<void>
}

const tokens: Token[] = [
    {
        symbol: 'USDC',
        icon: '/app/icons/svg/usdc-icon.png',
        balance: '295.00',
    },
    {
        symbol: 'DROP',
        icon: '/app/icons/svg/drop-token.png',
        balance: '1000.00',
    },
]

export default function TokenSelector({ defaultToken = 'USDC', onTokenSelectAction }: TokenSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedToken, setSelectedToken] = useState(defaultToken)
    const currentToken = tokens.find(t => t.symbol === selectedToken) || tokens[0]

    const handleTokenSelect = async (symbol: string) => {
        setSelectedToken(symbol)
        setIsOpen(false)
        await onTokenSelectAction(symbol)
    }

    return (
        <div className='mb-3 w-full'>
            <div className='mb-2 pl-[12px] text-[14px] font-medium'>Select Token</div>
            <div className='relative'>
                {isOpen && (
                    <div className='absolute bottom-full left-0 right-0 mb-2 rounded-[32px] border border-[#E5E7EB] bg-white shadow-lg'>
                        {tokens.map(token => (
                            <button
                                key={token.symbol}
                                onClick={() => handleTokenSelect(token.symbol)}
                                className='flex h-16 w-full items-center space-x-3 px-6 first:rounded-t-[32px] last:rounded-b-[32px] hover:bg-gray-50'>
                                <div className='flex h-9 w-9 items-center justify-center'>
                                    <Image
                                        src={token.icon}
                                        alt={`${token.symbol} icon`}
                                        width={36}
                                        height={36}
                                        className='h-9 w-9'
                                    />
                                </div>
                                <div className='flex flex-col items-start'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-[14px] font-semibold'>{token.symbol}</span>
                                    </div>
                                    <span className='text-[12px] font-medium text-gray-500'>
                                        {token.balance} available
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex h-16 w-full items-center justify-between rounded-full border border-[#E5E7EB] bg-white px-[14px]'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-9 w-9 items-center justify-center'>
                            <Image
                                src={currentToken.icon}
                                alt={`${currentToken.symbol} icon`}
                                width={36}
                                height={36}
                                className='h-9 w-9'
                            />
                        </div>
                        <div className='flex flex-col items-start'>
                            <div className='flex items-center gap-2'>
                                <span className='text-[14px] font-semibold'>{currentToken.symbol}</span>
                                <ChevronDown
                                    className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180' : '')}
                                />
                            </div>
                            <span className='text-[12px] font-medium text-gray-500'>
                                {currentToken.balance} available
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={e => {
                            e.stopPropagation()
                            // TODO: Implement max functionality
                        }}
                        className='rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#6993FF]'>
                        Max
                    </button>
                </button>
            </div>
        </div>
    )
}
