'use client'

import { cn } from '@/lib/utils/tailwind'
import Image from 'next/image'

interface AvatarsProps {
    className?: string
    numPeople?: number
    avatarUrls: string[]
}

const Avatars = ({ numPeople, className, avatarUrls }: AvatarsProps) => {
    return (
        <div className={cn('z-10 flex -space-x-2 rtl:space-x-reverse', className)}>
            {avatarUrls.map((url, index) => (
                <Image
                    key={index}
                    className='h-10 w-10 rounded-full border-2 border-white dark:border-gray-800'
                    src={url}
                    width={40}
                    height={40}
                    alt={`Avatar ${index + 1}`}
                    priority
                />
            ))}
            <a
                className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black'
                href=''>
                +{numPeople}
            </a>
        </div>
    )
}

export default Avatars
