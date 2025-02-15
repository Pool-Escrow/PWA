'use client'

import { Info, ArrowDownToLine, Copy, ExternalLink } from 'lucide-react'

export default function PayMeView() {
    const handleSave = () => {
        console.log('Save button clicked')
    }

    const handleCopy = () => {
        console.log('Copy button clicked')
    }

    const handleShare = () => {
        console.log('Share button clicked')
    }

    return (
        <div className='flex w-full flex-col items-center'>
            {/* QR Code Card */}
            <div className='w-[345px] overflow-hidden rounded-[32px] bg-[#4078F4] p-8 text-center text-white'>
                <h2 className='mb-7 text-[18px] font-bold'>Pool Wallet</h2>

                {/* Placeholder QR Code - replace with actual QR code component later */}
                <div className='mx-auto mb-6 size-[246px] bg-white p-4'>
                    {/* This is just a placeholder, we'll replace it with real QR code */}
                    <div className='size-full bg-[url("/qr-placeholder.png")] bg-contain bg-center bg-no-repeat' />
                </div>

                {/* Wallet Address with Etherscan Icon */}
                <div className='relative'>
                    <p className='mx-auto w-3/5 break-all text-center text-sm'>0xl927afweh92398ufsa993298Fds</p>
                </div>
            </div>

            {/* Help Section */}
            <button className='mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700'>
                <Info className='size-4' />
                <span className='text-base'>How do I receive tokens?</span>
            </button>

            {/* Action Buttons */}
            <div className='mt-8 flex gap-4'>
                <button
                    onClick={handleSave}
                    className='flex size-[60px] items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:bg-gray-300'>
                    <ArrowDownToLine className='size-8 text-blue-600' />
                </button>
                <button
                    onClick={handleCopy}
                    className='flex size-[60px] items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:bg-gray-300'>
                    <Copy className='size-8 text-blue-600' />
                </button>
                <button
                    onClick={handleShare}
                    className='flex size-[60px] items-center justify-center rounded-full bg-gray-100 transition-all hover:bg-gray-200 active:bg-gray-300'>
                    <ExternalLink className='size-8 text-blue-600' />
                </button>
            </div>
        </div>
    )
}
