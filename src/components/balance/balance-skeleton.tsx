import { Skeleton } from '@/components/ui/skeleton'

export default function BalanceSkeleton() {
    return (
        <span className='inline-flex h-10 w-full items-baseline whitespace-nowrap align-middle text-4xl font-bold'>
            <span>$</span>
            <Skeleton className='h-9 w-5 bg-[#5472E9]/20' />
            <span>,</span>
            <Skeleton className='h-9 w-16 bg-[#5472E9]/20' />
            <span>.</span>
            <Skeleton className='size-8 bg-[#5472E9]/20 text-2xl' />
            <Skeleton className='ml-2 h-4 w-10 bg-[#5472E9]/20 text-sm' />
        </span>
    )
}
