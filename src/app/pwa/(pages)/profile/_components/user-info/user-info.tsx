'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/app/pwa/_components/ui/avatar'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { getUserInfoAction } from '../../actions'
import { Skeleton } from '@/app/pwa/_components/ui/skeleton'
import ReactBlockies from 'react-blockies'
import { Tables } from '@/types/db'

type UserItem = Pick<Tables<'users'>, 'avatar' | 'displayName'> | null

export default function UserInfo({ initialUserInfo }: { initialUserInfo?: UserItem }) {
    const account = useAccount()

    const { avatar, displayName } = initialUserInfo || { displayName: '' }

    const { data: userInfo, isLoading } = useQuery<UserItem>({
        queryKey: ['userInfo', account.address],
        queryFn: async () => {
            const { data } = await getUserInfoAction()
            return data as UserItem
        },
        retry: (failureCount, error) => error.message === 'needsRefresh' && failureCount < 3,
        retryDelay: 1000,
        initialData: initialUserInfo ? undefined : initialUserInfo,
    })

    const truncatedAddress = account.address?.slice(0, 6) + '...' + account.address?.slice(-4)

    return (
        <section className='detail_card inline-flex w-full gap-[0.69rem] rounded-3xl p-6'>
            <Avatar className='size-14 cursor-pointer' aria-label='User Avatar'>
                {userInfo?.avatar ? (
                    <AvatarImage alt='User Avatar' src={userInfo.avatar} />
                ) : (
                    <ReactBlockies seed={account.address || '0x'} size={14} />
                )}
            </Avatar>
            <div className='flex-1 space-y-1'>
                <h1 className='font-medium'>{isLoading ? <Skeleton className='h-4 w-24' /> : userInfo?.displayName}</h1>
                <h2 className='font-mono text-xs text-[#5472E9]'>
                    {account.address ? truncatedAddress : <Skeleton className='h-4 w-16 bg-[#5472E9]/20' />}
                </h2>
            </div>
            <Link href={`https://sepolia.basescan.org/address/${account.address}`} passHref legacyBehavior>
                <a target='_blank' rel='external noopener noreferrer nofollow' className='self-center'>
                    <ExternalLinkIcon className='size-6' />
                </a>
            </Link>
        </section>
    )
}
