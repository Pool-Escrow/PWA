import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/tailwind'

export default function BalanceSkeleton({
    className,
    size = 'default',
}: {
    className?: string
    size?: 'default' | 'small'
}) {
    const containerClass =
        size === 'default' ? 'h-[44px] w-[200px] items-baseline' : 'h-[16px] w-[100px] items-center text-sm'

    const amountClass = size === 'default' ? 'w-[150px]' : 'w-[70px]'
    const symbolClass = size === 'default' ? 'w-[40px]' : 'w-[25px]'
    const heightClass = size === 'default' ? 'h-[44px]' : 'h-[16px]'

    return (
        <div className={cn('flex gap-2', containerClass, className)}>
            <Skeleton className={cn(amountClass, heightClass)} />
            <Skeleton className={cn(symbolClass, heightClass)} />
        </div>
    )
}
