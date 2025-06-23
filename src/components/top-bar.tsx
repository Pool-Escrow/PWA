'use client'

import { SwitchChainDrawer } from '@/components/switch-chain-drawer'
import { Button } from '@/components/ui/button'
import { NetworkStatusBadge } from '@/components/ui/network-status-badge'
import { getPageTransition } from '@/lib/utils/animations'
import eyeInvisibleIcon from '@/public/app/icons/svg/eyeinvisible.svg'
import eyeVisibleIcon from '@/public/app/icons/svg/eyevisible.svg'
import { useDeveloperFeaturesVisible, useDeveloperStore } from '@/stores/developer.store'
import { useEncryptStore } from '@/stores/encrypt'
import { motion } from 'framer-motion'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { base, baseSepolia, type Chain } from 'viem/chains'
import { useChainId } from 'wagmi'
import BackButton from './back-button'
import UserMenu from './user-menu'

export type TopBarProps = {
    backButton?: boolean
    actionButton?: React.ReactNode
    title?: string
}

function TopBarContent({ backButton, actionButton, title }: TopBarProps) {
    const pathname = usePathname()
    const pageTransition = getPageTransition(pathname)
    const { isEncoded, toggleEncryption } = useEncryptStore()

    return (
        <motion.div
            variants={pageTransition.variants}
            initial={false}
            animate='animate'
            exit='exit'
            key={pathname}
            transition={pageTransition.transition}
            className='grid h-24 grid-cols-[1fr_auto_1fr] items-center'>
            <div className='w-6'>{backButton && <BackButton />}</div>
            <div className='text-center text-[14px] font-medium text-black'>{Boolean(title) && title}</div>
            <div className='flex items-center gap-4 justify-self-end'>
                <Button
                    size='icon'
                    variant='ghost'
                    className='z-10 size-6 text-white hover:bg-transparent'
                    onClick={toggleEncryption}>
                    <Image
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        src={isEncoded ? eyeVisibleIcon : (eyeInvisibleIcon as StaticImport)}
                        alt={isEncoded ? 'Show balance' : 'Hide balance'}
                        className='size-6'
                    />
                </Button>
                {actionButton ?? <UserMenu />}
            </div>
        </motion.div>
    )
}

export default function TopBar(props: TopBarProps) {
    const chainId = useChainId()
    const [showChainDrawer, setShowChainDrawer] = useState(false)

    // Developer mode integration - ONLY for NetworkStatusBadge control
    const isDeveloperFeaturesVisible = useDeveloperFeaturesVisible()
    const { settings } = useDeveloperStore()

    const getTargetChain = (): Chain => {
        return chainId === base.id ? baseSepolia : base
    }

    const shouldShowNetworkBadge = () => {
        // Always show in production for non-developer users
        if (!isDeveloperFeaturesVisible) {
            return true
        }
        // In developer mode, respect the setting
        return settings.showNetworkIndicator
    }

    return (
        <header className='relative z-30 bg-transparent text-white'>
            <nav className='mx-auto h-[68px] max-w-screen-md px-safe-or-6'>
                {/* Network status badge - ONLY this is conditional based on developer settings */}
                {shouldShowNetworkBadge() && (
                    <div className='absolute left-2 top-1 z-40'>
                        <NetworkStatusBadge variant='compact' showSwitchButton={true} />
                    </div>
                )}
                {/* Original TopBarContent - UNCHANGED */}
                <TopBarContent {...props} />
            </nav>
            {/* Development-only chain switch drawer */}
            {isDeveloperFeaturesVisible && settings.showChainSelector && (
                <SwitchChainDrawer
                    open={showChainDrawer}
                    onOpenChange={setShowChainDrawer}
                    targetChain={getTargetChain()}
                    onSwitched={() => setShowChainDrawer(false)}
                    title='Switch Network'
                    description='Change between Base Mainnet and Base Sepolia.'
                />
            )}
        </header>
    )
}
