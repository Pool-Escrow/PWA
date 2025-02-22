import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'

interface PoolDetailsCardBannerProps {
    imageUrl: string
    name: string
    buttons?: React.ReactNode
    status?: React.ReactNode
}

export default function PoolDetailsBanner({ imageUrl, name, buttons, status }: PoolDetailsCardBannerProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    return (
        <div className='detail_card_banner relative overflow-hidden'>
            <AnimatePresence mode='wait'>
                <motion.div
                    key={`banner-${imageUrl}`}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{
                        opacity: isLoaded ? 1 : 0,
                        scale: isLoaded ? 1 : 1.1,
                    }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{
                        duration: 0.5,
                        type: 'spring',
                        bounce: 0.2,
                    }}
                    className='relative h-full w-full'>
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className='object-cover'
                        priority
                        onLoad={() => setIsLoaded(true)}
                    />
                </motion.div>
            </AnimatePresence>
            {buttons}
            <div className='detail_card_banner_status'>{status}</div>
        </div>
    )
}
