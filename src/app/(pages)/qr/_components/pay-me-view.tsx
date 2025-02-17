'use client'

import { useWallets } from '@privy-io/react-auth'
import { ArrowDownToLine, Copy, ExternalLink, Info } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function PayMeView() {
    const { wallets } = useWallets()
    const address = wallets[0]?.address

    const handleSave = () => {
        console.log('Save button clicked')
    }

    const handleCopy = () => {
        if (address) {
            try {
                void navigator.clipboard.writeText(address)
                // You might want to add a toast notification here
            } catch (error) {
                console.error('Failed to copy:', error)
            }
        }
    }

    const handleShare = () => {
        console.log('Share button clicked')
    }

    return (
        <div className='flex w-full flex-col items-center'>
            {/* QR Code Card */}
            <div className='w-[345px] overflow-hidden rounded-[32px] bg-[#4078F4] p-4 text-center text-white sm:p-8'>
                <h2 className='mb-5 text-[18px] font-bold sm:mb-7'>Pool Wallet</h2>

                {/* QR Code */}
                <div className='mx-auto mb-6 size-[246px] bg-white p-4'>
                    <QRCode
                        size={214}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        value={address || ''}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                {/* Wallet Address with Etherscan Icon */}
                <div className='relative'>
                    <p className='mx-auto w-4/5 max-w-[246px] break-all text-center text-sm'>{address}</p>
                </div>
            </div>

            {/* Help Section */}
            <button className='mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700'>
                <Info className='size-4' />
                <span className='text-base'>How do I receive tokens?</span>
            </button>

            {/* Action Buttons */}
            <div className='mt-4 flex gap-4 sm:mt-8'>
                <button
                    onClick={handleSave}
                    className='flex size-[48px] items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:bg-gray-300 sm:size-[60px]'>
                    <ArrowDownToLine className='size-6 text-blue-600 sm:size-8' />
                </button>
                <button
                    onClick={handleCopy}
                    className='flex size-[48px] items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:bg-gray-300 sm:size-[60px]'>
                    <Copy className='size-6 text-blue-600 sm:size-8' />
                </button>
                <button
                    onClick={handleShare}
                    className='flex size-[48px] items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:bg-gray-300 sm:size-[60px]'>
                    <ExternalLink className='size-6 text-blue-600 sm:size-8' />
                </button>
            </div>
        </div>
    )
}
