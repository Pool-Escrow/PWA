'use client'

import { cn } from '@/lib/utils/tailwind'
import { useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function NumberTicker({
    value,
    className,
    padding = 0,
}: {
    value: number
    className?: string
    padding?: number
}) {
    const ref = useRef<HTMLSpanElement>(null)
    const [prevValue, setPrevValue] = useState(value)
    const motionValue = useMotionValue(value)
    const springValue = useSpring(motionValue, { duration: 500 })

    useEffect(() => {
        if (value !== prevValue) {
            motionValue.set(value)
            setPrevValue(value)
        }
    }, [value, prevValue, motionValue])

    useEffect(() => {
        if (!ref.current) return

        const unsubscribe = springValue.on('change', latest => {
            if (ref.current) {
                const formattedValue = Math.abs(Math.floor(latest)).toString().padStart(padding, '0')
                ref.current.textContent = formattedValue
            }
        })

        return unsubscribe
    }, [springValue, padding])

    const displayValue = Math.abs(value).toString().padStart(padding, '0')

    return (
        <span className={cn('inline-block tabular-nums', className)} ref={ref}>
            {displayValue}
        </span>
    )
}
