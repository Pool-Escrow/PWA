import { Button } from '@/app/pwa/_components/ui/button'
import { cn } from '@/lib/utils/tailwind'
import { AnimatePresence, motion } from 'framer-motion'
import { debounce } from 'lodash'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { generateChars } from './generate-encoded-text'

interface EncryptTextProps {
    children: React.ReactNode
    isEncoded: boolean
    setIsEncoded: (value: boolean) => void
    balance: {
        integerPart: number
        fractionalPart: number
    }
    symbol: string
    color?: string
}

const formatNumber = (num: number, padLength: number) =>
    num
        .toString()
        .padStart(padLength, '0')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

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
    isEncoded,
    setIsEncoded,
    balance,
    symbol,
    color = 'black',
}) => {
    const [childrenVisible, setChildrenVisible] = useState(true)

    const handleToggle = useMemo(
        () =>
            debounce(() => {
                if (!childrenVisible && isEncoded) {
                    setIsEncoded(false)
                    setTimeout(() => {
                        setChildrenVisible(true)
                    }, 1000)
                    return
                }

                if (childrenVisible && !isEncoded) {
                    setChildrenVisible(false)
                    setTimeout(() => {
                        setIsEncoded(true)
                    }, 50)
                    return
                }
            }, 300),
        [childrenVisible, isEncoded, setIsEncoded],
    )

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

    // const isBalanceZero = balance.integerPart === 0 && balance.fractionalPart === 0

    // if (isBalanceZero) {
    //     return (
    //         <div className='relative inline-flex w-full justify-between whitespace-nowrap align-middle'>
    //             <div className={cn('relative inline-flex items-baseline gap-2 text-4xl font-bold', `text-[${color}]`)}>
    //                 <div className={''}>{children}</div>
    //             </div>
    //             <Button
    //                 size='icon'
    //                 variant='ghost'
    //                 className={cn(`z-10 size-4 sm:size-6`, `text-[${color}]`)}
    //                 onClick={handleToggle}>
    //                 {isEncoded ? <EyeIcon /> : <EyeOffIcon />}
    //             </Button>
    //         </div>
    //     )
    // }

    return (
        <div className='relative mb-6 inline-flex w-full justify-between whitespace-nowrap align-middle'>
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
            <Button
                size='icon'
                variant='ghost'
                className={cn(`z-10 size-4 sm:size-6`, `text-[${color}]`)}
                onClick={handleToggle}>
                {isEncoded ? <EyeIcon /> : <EyeOffIcon />}
            </Button>
        </div>
    )
}

export default EncryptText
