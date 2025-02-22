'use client'

import Image from 'next/image'
import type { Token } from '../types'
import { CONFIG } from './config'

interface ToSectionProps {
    receivedAmount: string
}

export function ToSection({ receivedAmount }: ToSectionProps) {
    const toToken: Token = CONFIG.CHAIN.BASE.tokens.USDC

    return (
        <div className='rounded-b-[24px] border-t border-[#f0f0f0] bg-white p-4'>
            <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-[#8f8f8f]'>To</span>
                    <div className='flex items-center gap-1 text-[#383838]'>
                        <Image src='/Subtract.svg' alt='Base' width={16} height={16} className='size-4' />
                        <span className='text-sm'>BASE - Pool Wallet</span>
                    </div>
                </div>
                <span className='text-sm text-[#383838]'>Receiving</span>
            </div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='size-8 overflow-hidden rounded-xl'>
                        <Image
                            src={toToken.tokenLogoUrl || '/placeholder.svg'}
                            alt='USDC'
                            width={32}
                            height={32}
                            className='size-full object-cover'
                        />
                    </div>
                    <span className='text-xl font-bold'>{toToken.tokenSymbol}</span>
                </div>
                <span
                    className={`text-2xl font-bold ${
                        receivedAmount && Number(receivedAmount) !== 0 ? 'text-black' : 'text-[#b3b3b3]'
                    }`}>
                    {receivedAmount}
                </span>
            </div>
        </div>
    )
}
