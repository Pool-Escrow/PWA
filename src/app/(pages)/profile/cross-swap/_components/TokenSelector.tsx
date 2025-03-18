import { Input } from '@/app/_components/ui/input'
import { Search, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import type { OKXNetwork, OKXToken } from '../types'
import { ServiceUnavailableMessage } from './ServiceUnavailableMessage'

export interface TokenSelectorProps {
    onClose: () => void
    filteredTokens: OKXToken[]
    selectedNetwork: string
    searchQuery: string
    onSearchChange: (value: string) => void
    onNetworkSelect: (network: string) => void
    onTokenSelect: (token: OKXToken) => void
    networks: OKXNetwork[]
    isLoading: boolean
    error: Error | null
    isServiceUnavailable: boolean
}

export const TokenSelector = ({
    onClose,
    filteredTokens,
    selectedNetwork,
    searchQuery,
    onSearchChange,
    onNetworkSelect,
    onTokenSelect,
    networks,
    isLoading,
    error,
    isServiceUnavailable,
}: TokenSelectorProps) => {
    const [networkName, setNetworkName] = useState('all')

    return (
        <>
            <div className='flex flex-row items-center justify-between pt-4'>
                <div className='pt-2 text-lg font-semibold'>Select Token</div>
                <button onClick={onClose} className='absolute right-6 top-4 text-gray-500 hover:text-gray-700'>
                    <X className='size-6' />
                </button>
            </div>

            {/* Search input */}
            <div className='mt-4'>
                <div className='relative flex h-[42px] items-center'>
                    <Search className='absolute left-3 z-10 size-5 text-gray-400' />
                    <Input
                        placeholder='Search'
                        className='h-[42px] w-full rounded-full border-gray-200 pl-10'
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className='mt-6'>
                <div className='mb-4 text-[12px] font-bold text-black'>
                    Select network: {selectedNetwork !== 'all' ? networkName : 'All'}
                </div>
                <div className='relative -mx-6'>
                    <div className='flex gap-2 overflow-x-scroll px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                        <button
                            onClick={() => onNetworkSelect('all')}
                            className={`flex h-[44px] min-w-[54px] shrink-0 items-center justify-center rounded-[6px] border border-solid ${
                                selectedNetwork === 'all' ? 'border-black' : 'border-[#E1E1E1]'
                            } p-0`}>
                            <div className='text-sm font-medium'>All</div>
                        </button>
                        {networks.map(network => {
                            const networkKey = (() => {
                                const name = network.chainName?.toLowerCase().replace(/\s+/g, '')
                                // Special cases mapping
                                switch (name) {
                                    case 'avalanchecchain':
                                    case 'avalanchec':
                                        return 'avalanche'
                                    case 'ethereummainnet':
                                    case 'ethereum':
                                        return 'eth'
                                    case 'bnbsmartchain':
                                    case 'bnbchain':
                                        return 'binance'
                                    case 'xlayer':
                                        return 'okbwebp'
                                    default:
                                        return name
                                }
                            })()
                            const hasIcon = [
                                'arbitrum',
                                'avalanche',
                                'base',
                                'binance',
                                'eth',
                                'linea',
                                'okb',
                                'optimism',
                                'polygon',
                                'scroll',
                                'solana',
                                'tron',
                                'zksyncera',
                            ].includes(networkKey)

                            return (
                                <button
                                    key={network.chainId}
                                    onClick={() => {
                                        onNetworkSelect(network.chainId)
                                        setNetworkName(network.chainName)
                                    }}
                                    className={`flex h-[44px] min-w-[54px] shrink-0 items-center justify-center rounded-[6px] border border-solid ${
                                        selectedNetwork === network.chainId ? 'border-black' : 'border-[#E1E1E1]'
                                    } p-0`}>
                                    {hasIcon ? (
                                        <Image
                                            src={`/chain-icons/${networkKey}.webp`}
                                            alt={network.chainName}
                                            width={24}
                                            height={24}
                                            className='size-6'
                                        />
                                    ) : (
                                        <div className='flex size-6 items-center justify-center rounded-full bg-gray-100 text-sm font-medium'>
                                            {network.chainName?.[0] || '?'}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Token list */}
            <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-6 space-y-2 overflow-y-scroll'>
                {isLoading ? (
                    <div className='flex items-center justify-center py-8'>
                        <div className='size-6 animate-spin rounded-full border-2 border-gray-300 border-t-black' />
                    </div>
                ) : isServiceUnavailable ? (
                    <ServiceUnavailableMessage onRetry={() => onNetworkSelect(selectedNetwork)} />
                ) : error ? (
                    <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
                        <div className='text-sm text-gray-500'>Unable to load tokens. Please try again later.</div>
                        <button
                            onClick={() => onNetworkSelect(selectedNetwork)}
                            className='text-sm font-medium text-blue-600 hover:text-blue-700'>
                            Retry
                        </button>
                    </div>
                ) : filteredTokens.length === 0 ? (
                    <div className='py-8 text-center text-sm text-gray-500'>
                        No tokens found for the selected network
                    </div>
                ) : (
                    filteredTokens.map(token => (
                        <button
                            key={token.tokenContractAddress}
                            onClick={() => onTokenSelect(token)}
                            className='flex w-full items-center justify-between overflow-y-scroll rounded-xl p-3 hover:bg-gray-50'>
                            <div className='flex items-center gap-3'>
                                <div className='size-8 overflow-y-scroll rounded-full'>
                                    <Image
                                        src={token.tokenLogoUrl || '/placeholder.svg'}
                                        alt={token.tokenSymbol}
                                        width={32}
                                        height={32}
                                        className='size-full object-cover'
                                    />
                                </div>
                                <div className='flex flex-col items-start overflow-y-scroll'>
                                    <span className='font-medium'>{token.tokenSymbol}</span>
                                    <span className='text-sm text-gray-500'>{token.tokenName}</span>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </>
    )
}
