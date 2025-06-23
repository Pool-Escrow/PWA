'use client'

import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useState } from 'react'

const PoolCardRowImage = ({ image }: { image: string }) => {
    const [isLoading, setLoading] = useState(true)

    const handleLoad = () => {
        setLoading(false)
    }

    return (
        <div className='relative size-9 overflow-hidden rounded-lg'>
            {isLoading && <Skeleton className='absolute inset-0 size-full' />}
            <Image
                src={image}
                alt='pool card row image'
                fill
                fetchPriority='low'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                onLoad={handleLoad}
            />
        </div>
    )
}

export default PoolCardRowImage
