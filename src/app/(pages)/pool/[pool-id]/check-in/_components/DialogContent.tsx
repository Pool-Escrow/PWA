import { cn } from '@/lib/utils/tailwind'

// First, create a new component for the dialog content structure
type DialogContentProps = {
    avatar?: React.ReactNode
    title: string
    subtitle?: string
    titleColor?: 'default' | 'error' | 'primary' // Using semantic color names
    footer: React.ReactNode
    italicSubtitle?: boolean
}

export function DialogContent({
    avatar,
    title,
    subtitle,
    titleColor = 'default',
    footer,
    italicSubtitle = true,
}: DialogContentProps) {
    return (
        <div className='flex size-full flex-col'>
            <div className='flex size-full flex-col items-center justify-center gap-1 pt-[9px] md:gap-2'>
                {avatar}
                <h2
                    className={cn('whitespace-pre-line text-center text-[15px] font-medium md:text-[24px]', {
                        'text-[#FE6651]': titleColor === 'error',
                        'text-[#6993FF]': titleColor === 'primary',
                    })}>
                    {title}
                </h2>
                {subtitle && (
                    <p className={cn('text-[12px] font-medium md:text-[20px]', italicSubtitle && 'italic')}>
                        {subtitle}
                    </p>
                )}
            </div>
            <div className='flex h-12 w-full flex-row items-end justify-between gap-[10px] align-bottom md:h-[100px]'>
                {footer}
            </div>
        </div>
    )
}
