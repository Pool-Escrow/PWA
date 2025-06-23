'use client'

import { SwitchChainDrawer } from '@/components/switch-chain-drawer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useOnRamp } from '@/hooks/use-onramp'
import bridgeIcon from '@/public/app/icons/svg/bridge-icon.svg'
import qrIcon from '@/public/app/icons/svg/qr-icon.svg'
import walletIcon from '@/public/app/icons/svg/wallet-icon.svg'
import withdrawIcon from '@/public/app/icons/svg/withdraw.svg'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ActionBar() {
    const router = useRouter()
    const { login, authenticated } = useAuth()
    const { handleOnRamp, error, clearError, requiredChain } = useOnRamp()
    const [showChainSwitchDrawer, setShowChainSwitchDrawer] = useState(false)

    // Show chain switch drawer when there's a chain error
    useEffect(() => {
        if (error?.type === 'CHAIN_NOT_SUPPORTED') {
            setShowChainSwitchDrawer(true)
        }
    }, [error])

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

        void (async () => {
            const success = await handleOnRamp()
            if (!success && error?.type === 'CHAIN_NOT_SUPPORTED') {
                setShowChainSwitchDrawer(true)
            }
        })()
    }

    const handlePayRequest = () => {
        if (!authenticated) {
            login()
            return
        }
        router.push('/qr')
    }

    const handleBridge = () => {
        if (!authenticated) {
            login()
            return
        }
        router.push('/profile/cross-swap')
    }

    const handleChainSwitched = () => {
        setShowChainSwitchDrawer(false)
        clearError()
        // Retry the onramp after successful chain switch
        void handleOnRamp()
    }

    const handleChainSwitchDrawerClose = (open: boolean) => {
        setShowChainSwitchDrawer(open)
        if (!open) {
            clearError()
        }
    }

    return (
        <>
            <div className='mx-auto flex h-[55px] w-full max-w-[340px] items-center justify-center rounded-[12px] bg-[#4078F4]'>
                {/* Pay/Request */}
                <Button
                    onClick={handlePayRequest}
                    className='flex h-full flex-1 flex-col items-center justify-center gap-1 bg-transparent hover:bg-transparent focus:bg-transparent'>
                    <Image className='size-6' src={qrIcon as StaticImport} alt='QR Code' />
                    <span className='text-[10px] font-semibold text-white'>Pay/Request</span>
                </Button>

                {/* Divider */}
                <div className='h-[18px] w-px bg-white/30' />

                {/* Deposit */}
                <Button
                    onClick={handleDeposit}
                    className='flex h-full flex-1 flex-col items-center justify-center gap-1 bg-transparent hover:bg-transparent focus:bg-transparent'>
                    <Image className='size-6' src={walletIcon as StaticImport} alt='Deposit' />
                    <span className='text-[10px] font-semibold text-white'>Deposit</span>
                </Button>

                {/* Divider */}
                <div className='h-[18px] w-px bg-white/30' />

                {/* Bridge */}
                <Button
                    onClick={handleBridge}
                    className='flex h-full flex-1 flex-col items-center justify-center gap-1 bg-transparent hover:bg-transparent focus:bg-transparent'>
                    <Image className='size-6' src={bridgeIcon as StaticImport} alt='Bridge' />
                    <span className='text-[10px] font-semibold text-white'>Bridge</span>
                </Button>

                {/* Divider */}
                <div className='h-[18px] w-px bg-white/30' />

                {/* Withdraw */}
                <Button
                    onClick={handleWithdraw}
                    className='flex h-full flex-1 flex-col items-center justify-center gap-1 bg-transparent hover:bg-transparent focus:bg-transparent'>
                    <Image className='size-6' src={withdrawIcon as StaticImport} alt='Withdraw' />
                    <span className='text-[10px] font-semibold text-white'>Withdraw</span>
                </Button>
            </div>

            {/* Chain Switch Drawer */}
            <SwitchChainDrawer
                open={showChainSwitchDrawer}
                onOpenChange={handleChainSwitchDrawerClose}
                targetChain={requiredChain}
                onSwitched={handleChainSwitched}
                title='Switch to Base Network'
                description='To use the deposit feature, you need to switch to the Base network.'
            />
        </>
    )
}
