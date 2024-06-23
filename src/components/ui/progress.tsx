import { cn } from '@/lib/utils/tailwind'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { forwardRef } from 'react'

const Progress = forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
    <ProgressPrimitive.Root
        ref={ref}
        className={cn('barBackground relative h-6 w-full overflow-hidden rounded-full', className)}
        {...props}>
        <ProgressPrimitive.Indicator
            className='size-full flex-1 transition-all'
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
