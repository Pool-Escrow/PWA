import { cn } from '@/lib/utils/tailwind'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    startAdornment?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type = 'text', startAdornment, ...props }, ref) => {
        const inputElement = (
            <input
                type={type}
                className={cn(
                    'relative h-[38px] w-full rounded-[70px] border border-[#ebebeb] pr-6 text-sm font-normal leading-tight text-black',
                    `${startAdornment ? 'pl-9' : 'pl-6'}`,
                    `${className}`,
                )}
                ref={ref}
                {...props}
            />
        )

        if (startAdornment) {
            return (
                <div className='relative inline-flex gap-2 align-baseline'>
                    <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-sm font-normal leading-tight text-zinc-500'>
                        {startAdornment}
                    </span>
                    {inputElement}
                </div>
            )
        }

        return inputElement
    },
)

Input.displayName = 'Input'

export { Input }
