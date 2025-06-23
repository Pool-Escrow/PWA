'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function NextUserPoolSkeleton() {
    return (
        <div className='flex h-24 items-center gap-[14px] rounded-3xl bg-white p-3 pr-4'>
            <Skeleton className='relative size-[76px] shrink-0 overflow-hidden rounded-[16px]' />
            <div className='flex flex-1 flex-col gap-[5px]'>
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-4 w-2/3' />
            </div>
        </div>
    )
}
