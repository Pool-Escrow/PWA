'use client'

import { Button } from '@/app/_components/ui/button'
import { useEncryptStore } from '@/app/_stores/encrypt'
import { getPageTransition } from '@/lib/utils/animations'
import eyeInvisibleIcon from '@/public/app/icons/svg/eyeinvisible.svg'
import eyeVisibleIcon from '@/public/app/icons/svg/eyevisible.svg'
import { motion } from 'motion/react'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
            transition={{
                type: 'spring',
                bounce: 0.2,
                duration: 0.4,
            }}
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
    return (
        <header className='z-30 bg-transparent text-white px-safe-or-6'>
            <nav className='mx-auto h-[68px] max-w-screen-md px-4'>
                <TopBarContent {...props} />
            </nav>
        </header>
    )
}
