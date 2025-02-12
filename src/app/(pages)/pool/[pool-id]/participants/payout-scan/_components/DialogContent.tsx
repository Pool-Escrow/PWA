// First, create a new component for the dialog content structure
type DialogContentProps = {
    avatar?: React.ReactNode
    title: string
    subtitle?: string
    titleColor?: string
    footer: React.ReactNode
}

export function DialogContent({ avatar, title, subtitle, titleColor = 'inherit', footer }: DialogContentProps) {
    return (
        <div className='flex h-full w-full flex-col'>
            <div className='flex h-full w-full flex-col items-center justify-center gap-1 pt-[9px] md:gap-2'>
                {avatar}
                <h2
                    className={`whitespace-pre-line text-center text-[15px] font-medium md:text-[24px]`}
                    style={{ color: titleColor }}>
                    {title}
                </h2>
                {subtitle && <p className='text-[12px] font-medium italic md:text-[20px]'>{subtitle}</p>}
            </div>
            <div className='flex h-12 w-full flex-row items-end justify-between gap-[10px] align-bottom md:h-[100px]'>
                {footer}
            </div>
        </div>
    )
}
