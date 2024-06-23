// src/components/bottom-bar/bottom-bar.tsx

'use client'

import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { AnimatePresence, motion } from 'framer-motion'

export default function BottomBar() {
    const { isVisible, content } = useBottomBarStore(state => state)

    if (!content) return null

    return (
        <AnimatePresence presenceAffectsLayout>
            {isVisible && (
                <motion.footer
                    initial={{ opacity: 0.7, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0.7, y: 100 }}
                    transition={{
                        duration: 0.2,
                        ease: 'easeInOut',
                    }}
                    className='fixed bottom-0 left-0 z-30 w-dvw'>
                    <nav className='flex-center mx-auto h-24 max-w-screen-md rounded-t-3xl bg-neutral-100/50 pb-3 shadow shadow-black/25 backdrop-blur-[32.10px] px-safe-or-6'>
                        {content}
                    </nav>
                </motion.footer>
            )}
        </AnimatePresence>
    )
}
