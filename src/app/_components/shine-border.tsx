'use client'

import { cn } from '@/lib/utils/tailwind'

type TColorProp = string | string[]

interface ShineBorderProps {
    borderRadius?: number
    borderWidth?: number
    duration?: number
    color?: TColorProp
    className?: string
    children: React.ReactNode
}

/**
 * @name Shine Border
 * @description It is an animated background border effect component with easy to use and configurable props.
 * @param borderRadius defines the radius of the border.
 * @param borderWidth defines the width of the border.
 * @param duration defines the animation duration to be applied on the shining border
 * @param color a string or string array to define border color.
 * @param className defines the class name to be applied to the component
 * @param children contains react node elements.
 */
export default function ShineBorder({
    borderRadius = 8,
    borderWidth = 1,
    duration = 14,
    color = '#000000',
    className,
    children,
}: ShineBorderProps) {
    return (
        <div
            style={
                {
                    '--border-radius': `${borderRadius}px`,
                    '--border-width': `${borderWidth}px`,
                    '--shine-pulse-duration': `${duration}s`,
                    '--background-radial-gradient': `radial-gradient(transparent,transparent, ${color instanceof Array ? color.join(',') : color},transparent,transparent)`,
                } as React.CSSProperties
            }
            className={cn('relative rounded-[--border-radius] p-[--border-width]', className)}>
            <div className='absolute inset-0 rounded-[--border-radius] [background-image:--background-radial-gradient] [background-size:300%_300%] motion-safe:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]' />
            <div className='relative z-10 rounded-[--border-radius] bg-background'>{children}</div>
        </div>
    )
}
