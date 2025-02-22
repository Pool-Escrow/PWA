'use client'

import Divider from '@/app/_components/divider'
import { Button } from '@/app/_components/ui/button'
import { cn } from '@/lib/utils/tailwind'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface OnRampFormProps {
    className?: string
    balance?: string
    decimalPlaces?: number
}
const OnRampForm = ({ className, balance, decimalPlaces }: OnRampFormProps) => {
    const [, setCopied] = useState(false)
    const [pageUrl, setPageUrl] = useState('')

    useEffect(() => {
        setPageUrl(window?.location?.href)
    }, [])

    try {
        void navigator.clipboard.writeText(pageUrl.replace('admin/', ''))

        toast.message('Share Link', {
            description: 'Copied link to clipboard!',
        })

        setCopied(true)
    } catch (error) {
        console.error('Failed to copy:', error)

        toast.error('Share Link', {
            description: 'Failed to copy link to clipboard!',
        })
    }

    return (
        <div className={cn('my-8 flex flex-col space-y-10 bg-white', className)}>
            <div>
                <div className='flex flex-row justify-between text-sm'>
                    <span className='font-medium'>Current Pool balance:</span>
                    <span className='font-medium'>
                        ${(BigInt(balance || '0') / BigInt(Math.pow(10, Number(decimalPlaces ?? 18)))).toString()} USDC
                    </span>
                </div>
                <Divider className='my-0 h-0 py-0' />
            </div>

            <div className='flex w-full flex-col'>
                <div className='mb-6 flex w-full flex-row items-center justify-between'>
                    <div className='flex flex-col'>
                        <div className='font-semibold'>Buy USDC</div>
                        <div className='text-sm text-gray-500'>Using cards, banks and international options</div>
                    </div>
                    <Button className='btn-cta h-10 w-20 rounded-[2rem] text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        Buy
                    </Button>
                </div>
                <div className='mb-6 flex w-full flex-row items-center justify-between'>
                    <div className='flex flex-col'>
                        <div className='font-semibold'>External Wallet</div>
                        <div className='text-sm text-gray-500'>Receive from Coinbase, Rainbow or Metamask</div>
                    </div>
                    <Button className='btn-cta h-10 w-20 rounded-[2rem] text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        Receive
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default OnRampForm
