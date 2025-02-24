'use client'

import { Avatar, AvatarImage } from '@/app/_components/ui/avatar'
import { ExternalLinkIcon, History } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/app/_components/ui/skeleton'
import { blo } from 'blo'
import { useUserInfo } from '@/hooks/use-user-info'
import { explorerUrl } from '@/app/_server/blockchain/server-config'

interface UserInfoProps {
    variant?: 'cross-swap'
    onHistoryClick?: () => void
    hasTransactions?: boolean
}

export default function UserInfo({ variant, onHistoryClick, hasTransactions }: UserInfoProps) {
    const { data: userInfo, isLoading } = useUserInfo()
    const address = userInfo?.address
    const truncatedAddress = address?.slice(0, 6) + '...' + address?.slice(-4)

    const handleEtherscanClick = () => {
        window.open(`${explorerUrl}/address/${address}`, '_blank')
    }

    return (
        <section className='detail_card inline-flex w-full gap-[0.69rem] rounded-3xl p-6'>
            <Avatar className='size-14 cursor-pointer' aria-label='User Avatar'>
                {isLoading ? (
                    <Skeleton className='size-14 rounded-full' />
                ) : (
                    <AvatarImage alt='user avatar' src={userInfo?.avatar || blo(address || '0x')} />
                )}
            </Avatar>
            <div className='flex-1 space-y-1'>
                <h1 className='font-medium'>
                    {isLoading ? <Skeleton className='h-4 w-24' /> : userInfo?.displayName || 'Anon User'}
                </h1>
                <div className='flex items-center gap-2'>
                    <button onClick={handleEtherscanClick} className='flex items-center gap-1'>
                        <h2 className='font-mono text-xs text-[#5472E9]'>
                            {address
                                ? truncatedAddress
                                : isLoading && <Skeleton className='h-4 w-16 bg-[#5472E9]/20' />}
                        </h2>
                        <ExternalLinkIcon className='size-[11px] text-[#5472E9]' />
                    </button>
                </div>
            </div>
            {variant === 'cross-swap' && (
                <button onClick={onHistoryClick} className='cursor-pointer self-center rounded-full bg-[#f4f4f4] p-2'>
                    <History className='size-6 text-[#383838]' />
                </button>
            )}
        </section>
    )
}
