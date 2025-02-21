'use client'

import { Avatar, AvatarImage } from '@/app/_components/ui/avatar'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { blo } from 'blo'
import { useUserInfo } from '@/hooks/use-user-info'
import { explorerUrl } from '@/app/_server/blockchain/server-config'
import { useMemo } from 'react'

export default function UserInfo() {
    const { data: userInfo, isLoading } = useUserInfo()
    const address = userInfo?.address
    const truncatedAddress = address?.slice(0, 6) + '...' + address?.slice(-4)

    // Memoize the avatar URL
    const avatarUrl = useMemo(() => userInfo?.avatar || (address ? blo(address) : ''), [userInfo?.avatar, address]);

    console.log("UserInfo Render:", userInfo);
    
    console.log('isLoading', isLoading)
    return (
        <section className='detail_card inline-flex w-full gap-[0.69rem] rounded-3xl p-6'>
            <Avatar className='size-14 cursor-pointer' aria-label='User Avatar'>
                {isLoading ? (
                    <Skeleton className='size-14 rounded-full' />
                ) : (
                    <AvatarImage alt='user avatar' src={avatarUrl} />
                )}
            </Avatar>
            <div className='flex-1 space-y-1'>
                <h1 className='font-medium'>
                    {isLoading ? <Skeleton className='h-4 w-24' /> : userInfo?.displayName || 'Anon User'}
                </h1>
                <h2 className='font-mono text-xs text-[#5472E9]'>
                    {address ? truncatedAddress : isLoading && <Skeleton className='h-4 w-16 bg-[#5472E9]/20' />}
                </h2>
            </div>
            <Link
                href={`${explorerUrl}/address/${address}`}
                passHref
                legacyBehavior
                title='View on Base block explorer'>
                <a target='_blank' rel='external noopener noreferrer nofollow' className='self-center'>
                    <ExternalLinkIcon className='size-6' />
                </a>
            </Link>
        </section>
    )
}
