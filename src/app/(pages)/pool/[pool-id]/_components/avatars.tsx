'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { cn } from '@/lib/utils/tailwind'

interface AvatarsProps {
    className?: string
    numPeople?: number
    avatarUrls: string[]
}

const Avatars = ({ numPeople, className, avatarUrls }: AvatarsProps) => {
    const displayedAvatars = avatarUrls.slice(-4)
    const remainingCount = Math.max(0, (numPeople ?? avatarUrls.length) - 4)

    return (
        <div className={cn('z-10 flex -space-x-2 rtl:space-x-reverse', className)}>
            {displayedAvatars.map((url, index) => (
                <Avatar
                    key={index}
                    className='size-10 rounded-full border-2 border-white dark:border-gray-800'
                    aria-label='User Avatar'>
                    <AvatarImage alt={`Avatar ${index + 1}`} src={url} />
                    <AvatarFallback className='bg-[#d9d9d9]' />
                </Avatar>
            ))}
            {remainingCount > 0 && (
                <div className='z-10 flex size-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black'>
                    +{remainingCount}
                </div>
            )}
        </div>
    )
}

export default Avatars
