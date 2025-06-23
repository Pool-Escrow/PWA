import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import type { Network, OKXToken } from '../types'

interface FromSectionProps {
    fromNetwork: Network
    fromToken: OKXToken | null
    fromAmount: string
    onSelectClick: () => void
    onAmountChange: (amount: string) => void
    balance?: string
}

export function FromSection({
    fromNetwork,
    fromToken,
    fromAmount,
    onSelectClick,
    onAmountChange,
    balance = '0.0042',
}: FromSectionProps) {
    return (
        <div className='rounded-t-[24px] bg-[#f4f4f4] p-4'>
            <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-[#8f8f8f]'>From</span>
                    <button onClick={onSelectClick} className='flex items-center gap-1 text-[#383838]'>
                        <NetworkIcon network={fromNetwork} />
                        <span className='text-sm'>{fromNetwork.chainName}</span>
                    </button>
                </div>
                <div className='flex items-center gap-1 text-sm'>
                    <span className='text-[#383838]'>{balance}</span>
                    <button className='text-[#5977ee]'>Max</button>
                </div>
            </div>
            <div className='flex items-center justify-between'>
                <button onClick={onSelectClick} className='flex items-center gap-2'>
                    <div className='size-8 overflow-hidden rounded-xl bg-[#d9d9d9]'>
                        <Image
                            src={fromToken?.tokenLogoUrl || '/placeholder.svg'}
                            alt={fromToken?.tokenName || ''}
                            width={32}
                            height={32}
                            className='size-full object-cover'
                        />
                    </div>
                    <span className='text-xl font-bold'>{fromToken?.tokenSymbol}</span>
                    <ChevronDown className='ml-1 size-5 text-[#8f8f8f]' />
                </button>
                <input
                    type='number'
                    value={fromAmount}
                    onChange={e => onAmountChange(e.target.value)}
                    onFocus={e => {
                        const val = e.target.value
                        e.target.value = ''
                        e.target.value = val
                    }}
                    className={`w-32 bg-transparent text-right text-2xl font-bold outline-none ${
                        fromAmount && Number(fromAmount) !== 0 ? 'text-black' : 'text-[#b3b3b3]'
                    }`}
                    placeholder='0.0'
                />
            </div>
        </div>
    )
}

function NetworkIcon({ network }: { network: Network }) {
    const networkKey = (() => {
        const name = network.chainName?.toLowerCase().replace(/\s+/g, '')
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
                return 'okb'
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

    if (hasIcon) {
        return (
            <Image
                src={`/chain-icons/${networkKey}.webp`}
                alt={network.chainName}
                width={16}
                height={16}
                className='size-4'
            />
        )
    }

    return <div className='size-4 rounded-full bg-[#d9d9d9]'>{network.chainName?.[0] || '?'}</div>
}
