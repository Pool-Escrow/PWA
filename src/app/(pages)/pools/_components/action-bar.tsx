'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import qrIcon from '@/public/app/icons/svg/qr-icon.svg'
import walletIcon from '@/public/app/icons/svg/wallet-icon.svg'
import withdrawIcon from '@/public/app/icons/svg/withdraw.svg'

export default function ActionBar() {
    return (
        <div className='relative mx-auto h-[55px] w-[296px]'>
            {/* QR Code Section */}
            <div className='absolute left-0 top-0 flex w-12 flex-col items-center gap-[10px]'>
                <Link href='/qr' className='flex flex-col items-center gap-[10px]'>
                    <Image className='size-8' src={qrIcon as StaticImport} alt='QR Code' />
                    <span className='text-[11px] font-semibold text-white'>Pay/Request</span>
                </Link>
            </div>

            {/* First Divider */}
            <div className='absolute left-[86px] top-[7px] h-[18px] w-px bg-[#D3D3D3]' />

            {/* Deposit Section */}
            <div className='absolute left-[124px] top-0 flex w-12 flex-col items-center gap-[10px]'>
                <Link href='/deposit' className='flex flex-col items-center gap-[10px]'>
                    <Image className='size-8' src={walletIcon as StaticImport} alt='Deposit' />
                    <span className='text-[11px] font-semibold text-white'>Deposit</span>
                </Link>
            </div>

            {/* Second Divider */}
            <div className='absolute left-[210px] top-[7px] h-[18px] w-px bg-[#D3D3D3]' />

            {/* Withdraw Section */}
            <div className='absolute left-[248px] top-0 flex w-12 flex-col items-center gap-[10px]'>
                <Link href='/withdraw' className='flex flex-col items-center gap-[10px]'>
                    <Image className='size-8' src={withdrawIcon as StaticImport} alt='Withdraw' />
                    <span className='text-[11px] font-semibold text-white'>Withdraw</span>
                </Link>
            </div>
        </div>
    )
}
