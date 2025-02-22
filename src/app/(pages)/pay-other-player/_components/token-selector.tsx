'use client'

import { Button } from '@/app/_components/ui/button'
import { currentTokenAddress, serverConfig } from '@/app/_server/blockchain/server-config'
import { cn } from '@/lib/utils/tailwind'
import { useWallets } from '@privy-io/react-auth'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getBalance } from '@wagmi/core'
import { dropTokenAddress } from '@/types/contracts'
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

    useEffect(() => {
        const fetchBalance = async () => {
            const dropBalance = await getBalance(serverConfig, {
                address: wallets[0].address as `0x${string}`,
                token: dropTokenAddress[8453],
            })
            const usdcBalance = await getBalance(serverConfig, {
                address: wallets[0].address as `0x${string}`,
                token: currentTokenAddress,
            })
            console.log(dropBalance, usdcBalance)
            return { dropBalance, usdcBalance }
        }
        fetchBalance()
            .then(balances => {
                console.log(balances)
                const newTokens = tokens.map(token => {
                    return {
                        ...token,
                        balance:
                            token.symbol === 'USDC' ? balances.usdcBalance.formatted : balances.dropBalance.formatted,
                    }
                })
                setTokens(newTokens)
                console.log(newTokens)
            })
            .catch(err => console.log(err))
    }, [selectedAddress, tokens, wallets])

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
                                        className='size-9'
                                    />
                                </div>
                                <div className='flex w-28 flex-col items-start'>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-[14px] font-semibold'>{token.symbol}</span>
                                    </div>
                                    <span className='text-[12px] font-medium text-gray-500'>
                                        {token.balance} available
                                    </span>
                                </div>
                            </Button>
                        ))}
                    </div>
                )}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className='flex h-16 w-full cursor-pointer items-center justify-between rounded-full border border-[#E5E7EB] bg-white px-[14px]'>
                    <div className='flex items-center gap-3'>
                        <div className='flex size-9 items-center justify-center'>
                            <Image
                                src={currentToken.icon}
                                alt={`${currentToken.symbol} icon`}
                                width={36}
                                height={36}
                                className='size-9'
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
                    <Button
                        onClick={e => {
                            e.stopPropagation()
                            onMaxClick?.(currentToken.balance)
                        }}
                        className='rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-medium text-[#6993FF] hover:bg-[#F3F4F6] focus:bg-[#F3F4F6]'>
                        Max
                    </Button>
                </div>
            </div>
        </div>
    )
}
