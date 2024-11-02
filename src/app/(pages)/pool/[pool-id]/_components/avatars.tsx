'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { formatNumberToMetric } from '@/app/_lib/utils/numbers'
import { cn } from '@/lib/utils/tailwind'
import { blo } from 'blo'
import { Address } from 'viem'

interface AvatarsProps {
    className?: string
    numPeople?: number
    avatarUrls: Array<{ url?: string; address: Address }>
}

const Avatars = ({ numPeople, className, avatarUrls }: AvatarsProps) => {
    const displayedAvatars = avatarUrls.slice(-4)
    const remainingCount = Math.max(0, (numPeople ?? avatarUrls.length) - 4)
    const formattedCount = formatNumberToMetric(remainingCount)

    return (
        <div className={cn('z-10 flex -space-x-2 rtl:space-x-reverse', className)}>
            {displayedAvatars.map(({ url, address }, index) => (
                <Avatar
                    key={index}
                    className='size-10 rounded-full border-2 border-white bg-white'
                    aria-label='User Avatar'>
                    <AvatarImage alt={`Avatar ${index + 1}`} src={url || blo(address)} />
                    <AvatarFallback className='bg-[#d9d9d9]'>{address.slice(2, 6)}</AvatarFallback>
                </Avatar>
            ))}
            {remainingCount > 0 && (
                <div className='z-10 flex size-10 items-center justify-center rounded-full border-2 border-white bg-[#2989EC] text-center text-xs font-bold text-white'>
                    +{formattedCount}
                </div>
            )}
        </div>
    )
}

export default Avatars
