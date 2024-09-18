'use client'

import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import PoolList from './pool-list'
import type { Route } from 'next'
import { useUserNextPool } from '@/hooks/use-user-next-pool'

export default function NextUserPool() {
    const { data: pool, isLoading, error } = useUserNextPool()

    const noNextPool = isLoading || error || !pool

    return (
        <>
            <Link href={'/my-pools' as Route} className='flex shrink justify-between'>
                <h1 className='text-lg font-semibold'>Your Pools</h1>
                <ChevronRightIcon className='size-6 text-[#1a70e0]' />
            </Link>
            {!noNextPool && <PoolList pools={[pool]} name='user' />}
        </>
    )
}
