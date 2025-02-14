import { cn } from '@/lib/utils/tailwind'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useMemo } from 'react'
import { generateChars } from './generate-encoded-text'
import { useEncryptStore } from '@/app/_stores/encrypt'

interface EncryptTextProps {
    children: React.ReactNode
    balance: {
        integerPart: number
        fractionalPart: number
    }
    symbol?: string
    color?: string
}

const formatNumber = (num: number, padLength: number) =>
    num
        .toString()
        .padStart(padLength, '0')
        // replace with commas to add thousand separators
        .replace(/\B(?=(\d{3})+(?!\d))/g, '')

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

const EncryptText: React.FC<EncryptTextProps> = ({ children, balance, symbol = '', color = 'black' }) => {
    const { isEncoded } = useEncryptStore()
    const childrenVisible = !isEncoded

    const formattedInteger = useMemo(() => formatNumber(balance.integerPart, 1), [balance.integerPart])
    const formattedFractional = useMemo(() => formatNumber(balance.fractionalPart, 2), [balance.fractionalPart])

    const encodedText = useMemo(
        () =>
            isEncoded
                ? {
                      integer: generateChars(4),
                      fractional: generateChars(2),
                      symbol: generateChars(3),
                  }
                : null,
        [isEncoded, formattedInteger.length],
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

    return (
        <div className='relative mb-6 inline-flex w-full whitespace-nowrap align-middle'>
            <div className={cn('relative inline-flex items-baseline gap-2 text-4xl font-bold', `text-[${color}]`)}>
                {!isEncoded && (
                    <div className={cn('absolute', childrenVisible ? 'opacity-100' : 'opacity-0')}>{children}</div>
                )}
                <div className={childrenVisible ? 'opacity-0' : 'opacity-100'}>
                    <AnimatePresence mode='popLayout' initial={false}>
                        {!isEncoded && (
                            <motion.div key='visible' className='absolute'>
                                {renderText('$')}
                                {renderText(formattedInteger, 'inline-block text-4xl tabular-nums')}
                                {renderText('.')}
                                {renderText(formattedFractional, 'inline-block text-2xl tabular-nums')}
                                <span className='ml-2'>{renderText(symbol || '', 'text-sm')}</span>
                            </motion.div>
                        )}

                        {isEncoded && (
                            <motion.div key='encoded' className='absolute blur-sm'>
                                {renderText('$')}
                                {renderText(encodedText?.integer || '', 'inline-block text-4xl tabular-nums')}
                                {renderText('.')}
                                {renderText(encodedText?.fractional || '', 'inline-block text-2xl tabular-nums')}
                                <span className='ml-2'>{renderText(encodedText?.symbol || '', 'text-sm')}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

export default EncryptText
