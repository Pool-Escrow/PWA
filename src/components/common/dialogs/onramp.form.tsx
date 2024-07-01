'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/tailwind'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Divider from '../other/divider'

interface OnRampFormProps {
    className?: string
    balance?: bigint
    decimalPlaces?: bigint
}
const OnRampForm = ({ className, balance, decimalPlaces }: OnRampFormProps) => {
    const [, setCopied] = useState(false)
    const [pageUrl, setPageUrl] = useState('')

    // const walletTokenBalance = useBalance({
    //     address: wallets[0]?.address as HexString,
    //     token: poolDetails?.poolDetailFromSC?.[4] as HexString,
    // })

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
                        ${((balance ?? BigInt(0)) / BigInt(Math.pow(10, Number(decimalPlaces)))).toString()} USDC
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
                    <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        Buy
                    </Button>
                </div>
                <div className='mb-6 flex w-full flex-row items-center justify-between'>
                    <div className='flex flex-col'>
                        <div className='font-semibold'>External Wallet</div>
                        <div className='text-sm text-gray-500'>Receive from Coinbase, Rainbow or Metamask</div>
                    </div>
                    <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        Receive
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default OnRampForm
