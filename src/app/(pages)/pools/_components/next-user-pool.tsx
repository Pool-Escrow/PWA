'use client'

import * as React from 'react'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import PoolList from './pool-list'
import { useUserNextPool } from '@/hooks/use-user-next-pool'

export default function NextUserPool() {
    const { data: pools, isLoading, error } = useUserNextPool()
    const hasNextPool = !isLoading && !error && pools

    return (
        <>
            <Link href='/my-pools' className='flex shrink justify-between px-2'>
                <h1 className='text-lg font-semibold'>Your Pools</h1>
                <div className='rounded-full p-1 active:bg-gray-100 flex items-center'>
                    <div className='text-sm text-[#1a70e0]'>View All</div>
                    <ChevronRightIcon className='size-6 text-[#1a70e0]' />
                </div>
            </Link>
            {hasNextPool && <PoolList pools={pools} name='user' />}
        </>
    )
}
