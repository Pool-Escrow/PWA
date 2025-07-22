'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/tailwind'
import { currentTokenAddress, serverConfig } from '@/server/blockchain/server-config'
import { dropTokenAddress } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import { getBalance } from '@wagmi/core'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import type { Address } from 'viem'

interface Token {
    symbol: string
    icon: string
    balance: string
    address: Address
}

interface TokenSelectorProps {
    onTokenSelect?: (address: Address) => void
    onMaxClick?: (amount: string) => void
}

const initialTokens: Token[] = [
    {
        symbol: 'USDC',
        icon: '/app/icons/svg/usdc-icon.png',
        balance: '0',
        address: currentTokenAddress,
    },
    {
        symbol: 'DROP',
        icon: '/app/icons/svg/drop-token.png',
        balance: '0',
        address: dropTokenAddress[8453],
    },
]

export default function TokenSelector({ onTokenSelect, onMaxClick }: TokenSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState<Address>(dropTokenAddress[8453])
    const [tokens, setTokens] = useState<Token[]>(initialTokens)
    const currentToken = tokens.find(t => t.address === selectedAddress) || tokens[0]
    const { wallets } = useWallets()

    // Get wallet address safely
    const walletAddress = wallets[0]?.address

    const fetchBalances = useCallback(async () => {
        // Guard: Only fetch if we have a valid wallet address
        if (!walletAddress) {
            if (process.env.NODE_ENV === 'development') {
                console.log('[DEBUG][TokenSelector] Skipping balance fetch - no wallet address')
            }
            return
        }

        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('[DEBUG][TokenSelector] getBalance DROP', {
                    address: walletAddress,
                    token: dropTokenAddress[8453],
                    chainId: 8453,
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                    timestamp: new Date().toISOString(),
                })
            }
            const dropBalance = await getBalance(serverConfig, {
                address: walletAddress as `0x${string}`,
                token: dropTokenAddress[8453],
            })

            if (process.env.NODE_ENV === 'development') {
                console.log('[DEBUG][TokenSelector] getBalance USDC', {
                    address: walletAddress,
                    token: currentTokenAddress,
                    chainId: 8453,
                    stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
                    timestamp: new Date().toISOString(),
                })
            }
            const usdcBalance = await getBalance(serverConfig, {
                address: walletAddress as `0x${string}`,
                token: currentTokenAddress,
            })

            console.log(dropBalance, usdcBalance)

            const newTokens = initialTokens.map(token => ({
                ...token,
                balance: token.symbol === 'USDC' ? usdcBalance.formatted : dropBalance.formatted,
            }))

            setTokens(newTokens)
            console.log(newTokens)
        } catch (err) {
            console.error('[TokenSelector] Error fetching balances:', err)
        }
    }, [walletAddress])

    // Only fetch balances when wallet address is available and changes
    useEffect(() => {
        if (walletAddress) {
            void fetchBalances()
        }
    }, [walletAddress, fetchBalances])

    const handleTokenSelect = (address: Address) => {
        const token = tokens.find(t => t.address === address)
        if (!token) return

        setSelectedAddress(address)
        setIsOpen(false)
        onTokenSelect?.(address)
    }

    return (
        <div className='mb-3 w-full'>
            <div className='mb-2 pl-[12px] text-[14px] font-medium'>Select Token</div>
            <div className='relative'>
                {isOpen && (
                    <div className='absolute inset-x-0 bottom-full mb-2 rounded-[32px] border border-[#E5E7EB] bg-white shadow-lg'>
                        {tokens.map(token => (
                            <Button
                                key={token.address}
                                onClick={() => handleTokenSelect(token.address)}
                                className='flex h-16 w-full items-center space-x-3 bg-white px-6 text-black first:rounded-t-[32px] last:rounded-b-[32px] hover:bg-gray-50 focus:bg-gray-50'>
                                <div className='flex size-9 items-center justify-center'>
                                    <Image
                                        src={token.icon}
                                        alt={`${token.symbol} icon`}
                                        width={36}
                                        height={36}
                                        className='rounded-full'
                                    />
                                </div>
                                <div className='flex flex-1 items-center justify-between'>
                                    <div className='flex flex-col'>
                                        <span className='text-[16px] font-medium'>{token.symbol}</span>
                                    </div>
                                    <span className='text-[14px] text-gray-600'>{token.balance}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}

                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex h-16 w-full items-center justify-between rounded-[32px] border border-[#E5E7EB] bg-white px-6 text-black hover:bg-gray-50 focus:bg-gray-50'>
                    <div className='flex items-center space-x-3'>
                        <div className='flex size-9 items-center justify-center'>
                            <Image
                                src={currentToken.icon}
                                alt={`${currentToken.symbol} icon`}
                                width={36}
                                height={36}
                                className='rounded-full'
                            />
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-[16px] font-medium'>{currentToken.symbol}</span>
                        </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                        <span className='text-[14px] text-gray-600'>{currentToken.balance}</span>
                        <div className='flex items-center space-x-1'>
                            <button
                                type='button'
                                onClick={e => {
                                    e.stopPropagation()
                                    onMaxClick?.(currentToken.balance)
                                }}
                                className='rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-600 hover:bg-blue-200'>
                                MAX
                            </button>
                            <ChevronDown
                                className={cn('size-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
                            />
                        </div>
                    </div>
                </Button>
            </div>
        </div>
    )
}
