import { cn } from '@/lib/utils/tailwind'
import { useEncryptStore } from '@/stores/encrypt'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useMemo } from 'react'
import { generateChars } from './generate-encoded-text'

interface EncryptTextProps {
    children: React.ReactNode
    balance: {
        integerPart: number
        fractionalPart: number
    }
    symbol?: string
    color?: string
    size?: 'default' | 'small'
    showCurrencySymbol?: boolean
    icon?: React.ReactNode
}

const MotionSpan = motion.span

const charVariants = {
    visible: { opacity: 1, y: 0, skew: 0 },
    hidden: (custom: number) => ({
        opacity: 0,
        y: '-200%',
        skew: custom % 2 === 0 ? 50 : -50,
        transition: { delay: custom * 0.05 },
    }),
}

const EncryptText: React.FC<EncryptTextProps> = ({
    children,
    color = 'black',
    size = 'default',
    showCurrencySymbol = true,
    icon: Icon,
}) => {
    const { isEncoded } = useEncryptStore()

    const encodedText = useMemo(
        () =>
            isEncoded
                ? {
                      integer: generateChars(4),
                      fractional: generateChars(2),
                      symbol: generateChars(3),
                  }
                : null,
        [isEncoded],
    )

    const renderText = (text: string, className: string = '') =>
        [...text].map((char, index) => (
            <MotionSpan
                key={index}
                custom={index}
                variants={charVariants}
                initial='hidden'
                animate='visible'
                exit='hidden'
                className={className}>
                {char}
            </MotionSpan>
        ))

    const containerSize = size === 'default' ? 'text-4xl' : 'text-sm'
    const integerSize = size === 'default' ? 'text-4xl' : 'text-sm'
    const fractionalSize = size === 'default' ? 'text-2xl' : 'text-xs'
    const symbolSize = size === 'default' ? 'text-sm' : 'text-xs'

    return (
        <span className={cn('relative inline-flex items-baseline font-bold', containerSize, `text-[${color}]`)}>
            <AnimatePresence mode='popLayout' initial={false}>
                {isEncoded ? (
                    <motion.span key='encoded' className='inline-flex items-center blur-sm'>
                        {Icon && <span className='mr-2'>{Icon}</span>}
                        {showCurrencySymbol && renderText('$')}
                        {renderText(encodedText?.integer || '', `inline-block ${integerSize} tabular-nums`)}
                        {renderText('.')}
                        {renderText(encodedText?.fractional || '', `inline-block ${fractionalSize} tabular-nums`)}
                        <span className='ml-2'>{renderText(encodedText?.symbol || '', symbolSize)}</span>
                    </motion.span>
                ) : (
                    <motion.span key='decoded'>{children}</motion.span>
                )}
            </AnimatePresence>
        </span>
    )
}

export default EncryptText
