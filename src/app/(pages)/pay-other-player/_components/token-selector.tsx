'use client'

import { usdcDeployments } from '@/app/_lib/blockchain/constants'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import { cn } from '@/lib/utils/tailwind'
import { useWallets } from '@privy-io/react-auth'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Address } from 'viem'
import { useBalance, useChainId } from 'wagmi'

interface Token {
    symbol: string
    icon: string
    balance: string
    address: `0x${string}`
}

interface TokenSelectorProps {
    defaultToken?: string
    onTokenSelectAction: (tokenSymbol: string, tokenAddress: `0x${string}`) => Promise<void>
    tokenBalances?: Record<`0x${string}`, string>
}

export default function TokenSelector({ onTokenSelectAction }: TokenSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)

    const chainId = useChainId()
    const { wallets } = useWallets()

    const tokens = [
        {
            symbol: 'DROP',
            icon: '/app/icons/svg/drop-token.png',
            address: currentTokenAddress,
            balance:
                useBalance({
                    address: wallets[0]?.address as Address,
                    token: currentTokenAddress,
                }).data?.formatted || '0',
        },
        {
            symbol: 'USDC',
            icon: '/app/icons/svg/usdc-icon.png',
            address: usdcDeployments[chainId as keyof typeof usdcDeployments],
            balance:
                useBalance({
                    address: wallets[0]?.address as Address,
                    token: usdcDeployments[chainId as keyof typeof usdcDeployments],
                }).data?.formatted || '0',
        },
    ]
    const [selectedToken, setSelectedToken] = useState('DROP')

    const currentToken = tokens.find(t => t.symbol === selectedToken) || tokens[0]

    const handleTokenSelect = async (symbol: string) => {
        const token = tokens.find(t => t.symbol === symbol)
        if (!token) return

        setSelectedToken(symbol)
        setIsOpen(false)
        await onTokenSelectAction(symbol, token.address)
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
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex h-16 w-full cursor-pointer items-center justify-between rounded-full border border-[#E5E7EB] bg-white px-[14px]'>
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
                </div>
            </div>
        </div>
    )
}
