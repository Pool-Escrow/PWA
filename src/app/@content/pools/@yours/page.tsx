import PoolList from '@/components/pools/pool-list/pool-list'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

export default function YourPools() {
    return (
        <>
            <Link href='/my-pools' className='flex justify-between'>
                <h1 className='text-lg font-semibold'>Your Pools</h1>
                <ChevronRightIcon className='size-6 text-[#1a70e0]' />
            </Link>
            <PoolList limit={3} />
        </>
    )
}
