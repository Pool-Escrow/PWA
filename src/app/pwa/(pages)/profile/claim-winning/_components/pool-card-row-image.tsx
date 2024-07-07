'use client'

import { Skeleton } from '@/app/pwa/_components/ui/skeleton'
import Image from 'next/image'
import { useState } from 'react'

const PoolCardRowImage = ({ image }: { image: string }) => {
    const [isLoading, setLoading] = useState(true)

    return (
        <div className='relative size-9 overflow-hidden rounded-lg'>
            {isLoading && <Skeleton className='absolute inset-0 size-full' />}
            <Image
                src={image}
                alt='pool image'
                fill
                fetchPriority='low'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                onLoad={() => setLoading(false)}
            />
        </div>
    )
}

export default PoolCardRowImage
