'use client'

import * as React from 'react'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import PoolList from './pool-list'
import { useUserNextPool } from '@/hooks/use-user-next-pool'
import { cn } from '@/lib/utils/tailwind'

export default function NextUserPool() {
    const { data: pools, isLoading, error } = useUserNextPool()
    const hasNextPool = !isLoading && !error && pools

    return (
        <div className={cn('detail_card rounded-[2rem] p-3 pt-[18px]', '!bg-[#F6F6F6] bg-[#F6F6F6]')}>
            <Link href='/my-pools' className='flex shrink justify-between'>
                <h1 className='pl-[6px] text-lg font-semibold'>Your Pools</h1>
                <div className='inline-flex h-[30px] items-center gap-1 pr-[6px]'>
                    <div className='text-[11px] font-semibold text-[#5472e9]'>View All</div>
                    <div className='flex size-[30px] items-center justify-center rounded-full bg-white'>
                        <ChevronRightIcon className='size-6 text-[#6993FF]' />
                    </div>
                </div>
            </Link>
            <div className='mt-4'>{hasNextPool && <PoolList pools={pools} name='user' />}</div>
        </div>
    )
}
