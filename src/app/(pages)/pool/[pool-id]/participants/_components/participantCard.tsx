import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { cn } from '@/lib/utils/tailwind'
import Link from 'next/link'
import { formatUnits, type Address } from 'viem'
import Image from 'next/image'
import circleTickIcon from '@/public/app/icons/svg/circle-tick-icon.svg'
import { formatAddress } from '@/app/_lib/utils/addresses'
import { TabValue } from './participants'
import { usePayoutStore } from '@/app/_client/stores/payout-store'

interface ParticipantCardProps {
    address: Address
    avatar: string
    displayName: string
    poolId: string
    status?: string | null
    isLoading?: boolean
    error?: boolean
    isAdmin: boolean
    wonAmount: number
    claimedAmount: number
    checkInAt?: string | null
    tabValue: TabValue
    tokenDecimals: number
}

export default function ParticipantCard({
    address,
    avatar,
    displayName,
    poolId,
    status = 'Registered',
    isLoading,
    error,
    isAdmin,
    wonAmount,
    claimedAmount,
    checkInAt,
    tabValue,
    tokenDecimals,
}: ParticipantCardProps) {
    if (isLoading) {
        return <div>Loading participant details...</div>
    }

    if (error) {
        return <div>Error loading participant details. Please try again.</div>
    }

    const participantStatus = checkInAt ? 'Checked In' : 'Registered'

    const savedPayoutAmount = usePayoutStore(state => state.getPayoutForParticipant(poolId, address))

    const Content = (
        <div className='flex w-full flex-row items-center justify-between'>
            <div className='flex flex-row space-x-4'>
                <Avatar className='size-[48px]' aria-label='User Avatar'>
                    <AvatarImage alt='User Avatar' src={avatar} />
                    <AvatarFallback className='bg-[#d9d9d9]' />
                </Avatar>

                <div className='flex flex-1 flex-col'>
                    <h4 className='overflow-hidden text-[12pt] font-medium text-black'>
                        {displayName} - <span className='italic'>{formatAddress(address)}</span>
                    </h4>
                    <p
                        className={cn(
                            `fontRegistered text-[10pt] ${participantStatus === 'Registered' ? 'font-medium text-[#B2B2B2]' : 'font-semibold text-[#6993FF]'} `,
                        )}>
                        {wonAmount > 0 ? 'Checked In - Paid' : participantStatus}
                    </p>
                </div>
            </div>

            {wonAmount === 0 && isAdmin && tabValue === TabValue.Winners && (
                <div className='flex flex-row items-center'>
                    <div className='flex h-[30px] w-[61px] items-center justify-center rounded-[9px] bg-[#8F919033] text-center text-[10px] font-medium text-[#848484]'>
                        {`${formatUnits(BigInt(savedPayoutAmount?.amount ?? 0), tokenDecimals)} USD`}
                    </div>
                </div>
            )}
            {wonAmount > 0 && isAdmin && tabValue === TabValue.Winners && (
                <div className='flex flex-row items-center'>
                    {claimedAmount === wonAmount && (
                        <Image src={circleTickIcon} alt='paid' width={12} height={12} className='mr-[6px]' />
                    )}
                    <div className='flex h-[30px] w-[61px] items-center justify-center rounded-[9px] bg-[#6993FF40] text-center text-[10px] font-medium text-[#6993FF]'>
                        {`${formatUnits(BigInt(wonAmount ?? 0), tokenDecimals)} USD`}
                    </div>
                </div>
            )}
        </div>
    )

    if (isAdmin) {
        return (
            <Link
                className={'bottom-2 flex flex-row space-x-4 border-b-[1px] border-[#E9F1F5] py-4'}
                href={`/pool/${poolId}/participants/${address}`}>
                {Content}
            </Link>
        )
    }

    return <div className={'bottom-2 flex flex-row space-x-4 border-b-[1px] border-[#E9F1F5] py-4'}>{Content}</div>
}
