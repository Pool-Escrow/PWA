'use client'

import { motion } from 'framer-motion'
import BackButton from './back-button'
import { usePathname } from 'next/navigation'
import { getPageTransition } from '@/lib/utils/animations'
import UserMenu from './user-menu'
import Image from 'next/image'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import eyeVisibleIcon from '@/public/app/icons/svg/eyevisible.svg'
import eyeInvisibleIcon from '@/public/app/icons/svg/eyeinvisible.svg'
import { Button } from '@/app/_components/ui/button'
import { useEncryptStore } from '@/app/_stores/encrypt'

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
            <div className='text-center'>{Boolean(title) && title}</div>
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
        <header className='z-30 bg-transparent text-white'>
            <nav className='mx-auto h-[68px] max-w-screen-md px-safe-or-6'>
                <TopBarContent {...props} />
            </nav>
        </header>
    )
}
