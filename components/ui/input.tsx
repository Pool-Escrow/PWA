import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    startAdornment?: React.ReactNode
    endAdornment?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, startAdornment, ...props }, ref) => {
    return (
        <>
            {startAdornment && (
                <span className='absolute z-10 h-[38px] content-center pl-6 text-xs font-normal leading-tight text-stone-500'>
                    {startAdornment}
                </span>
            )}
            <input
                type={type}
                className={cn(
                    'h-[38px] w-full rounded-[70px] border border-[#ebebeb] text-sm font-normal leading-tight text-black backdrop-blur-[2px]',
                    startAdornment ? 'pl-8' : 'pl-6',
                    className,
                )}
                ref={ref}
                {...props}
            />
        </>
    )
})
Input.displayName = 'Input'

export { Input }
