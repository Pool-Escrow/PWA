'use client'

import { useAuth } from '@/app/_client/hooks/use-auth'
import { Button } from '@/app/_components/ui/button'
import qrIcon from '@/public/app/icons/svg/qr-icon.svg'
import walletIcon from '@/public/app/icons/svg/wallet-icon.svg'
import withdrawIcon from '@/public/app/icons/svg/withdraw.svg'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ActionBar() {
    const router = useRouter()
    const { login, authenticated } = useAuth()

    const handleWithdraw = () => {
        if (!authenticated) {
            login()
            return
        }
        router.push('/profile/send')
    }
    const handleDeposit = () => {
        if (!authenticated) {
            login()
            return
        }
        router.push('/deposit')
    }
    const handlePayRequest = () => {
        if (!authenticated) {
            login()
            return
        }
        router.push('/qr')
    }

    return (
        <div className='relative mx-auto h-[55px] w-[296px]'>
            {/* QR Code Section */}
            <div className='absolute left-0 top-0 flex h-[55px] w-12 flex-col items-center gap-[10px]'>
                <Button
                    onClick={handlePayRequest}
                    className='flex h-full flex-col items-center gap-[10px] bg-[#4078F4] hover:bg-[#4078F4] focus:bg-[#4078F4]'>
                    <Image className='size-8' src={qrIcon as StaticImport} alt='QR Code' />
                    <span className='text-[11px] font-semibold text-white'>Pay/Request</span>
                </Button>
            </div>

            {/* First Divider */}
            <div className='absolute left-[86px] top-[7px] h-[18px] w-px bg-[#D3D3D3]' />

            {/* Deposit Section */}
            <div className='absolute left-[124px] top-0 flex h-[55px] w-12 flex-col items-center gap-[10px]'>
                <Button
                    onClick={handleDeposit}
                    className='flex h-full flex-col items-center gap-[10px] bg-[#4078F4] hover:bg-[#4078F4] focus:bg-[#4078F4]'>
                    <Image className='size-8' src={walletIcon as StaticImport} alt='Deposit' />
                    <span className='text-[11px] font-semibold text-white'>Deposit</span>
                </Button>
            </div>

            {/* Second Divider */}
            <div className='absolute left-[210px] top-[7px] h-[18px] w-px bg-[#D3D3D3]' />

            {/* Withdraw Section */}
            <div className='absolute left-[248px] top-0 flex h-[55px] w-12 flex-col items-center gap-[10px]'>
                <Button
                    onClick={handleWithdraw}
                    className='flex h-full flex-col items-center gap-[10px] bg-[#4078F4] hover:bg-[#4078F4] focus:bg-[#4078F4]'>
                    <Image className='size-8' src={withdrawIcon as StaticImport} alt='Withdraw' />
                    <span className='text-[11px] font-semibold text-white'>Withdraw</span>
                </Button>
            </div>
        </div>
    )
}
