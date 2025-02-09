'use client'

import * as React from 'react'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import PoolList from './pool-list'
import { useUserNextPool } from '@/hooks/use-user-next-pool'

export default function NextUserPool() {
    const { data: pool, isLoading, error } = useUserNextPool()

    const hasNextPool = !isLoading && !error && pool

    return (
        <>
            <Link href='/my-pools' className='flex shrink justify-between px-2'>
                <h1 className='text-lg font-semibold'>Your Pools</h1>
                <div className='rounded-full p-1 active:bg-gray-100'>
                    <ChevronRightIcon className='size-6 text-[#1a70e0]' />
                </div>
            </Link>
            {hasNextPool && <PoolList pools={[pool]} name='user' />}
        </>
    )
}
