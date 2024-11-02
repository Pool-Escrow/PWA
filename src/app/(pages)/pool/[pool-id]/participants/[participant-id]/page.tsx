'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { formatAddress } from '@/app/_lib/utils/addresses'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import PageWrapper from '@/components/page-wrapper'
import { getUserAdminStatusActionWithCookie } from '@/features/users/actions'
import { useParticipants } from '@/hooks/use-participants'
import { blo } from 'blo'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Address } from 'viem'
import { useWriteContract } from 'wagmi'
import { usePoolDetails } from '../../ticket/_components/use-pool-details'
import { useUserDetails } from '../_components/use-user-details'
import PayoutForm from './_components/payout-form'

type Props = {
    params: {
        'pool-id': string
        'participant-id': Address
    }
}

const ParticipantPayout = ({ params }: Props) => {
    const { 'participant-id': participantId, 'pool-id': poolId } = params
    const { data: userDetails } = useUserDetails(participantId)
    const { poolDetails } = usePoolDetails(poolId)

    const tokenAddress = poolDetails?.poolDetailFromSC?.[4] ?? currentTokenAddress

    const { data: hash, isPending, isSuccess } = useWriteContract()

    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    const [isAdminLoading, setIsAdminLoading] = useState(true)

    useEffect(() => {
        getUserAdminStatusActionWithCookie()
            .then(isUserAdmin => {
                setIsAdmin(isUserAdmin)
            })
            .finally(() => {
                setIsAdminLoading(false)
            })
    }, [])

    useEffect(() => {
        if (isSuccess) {
            toast.success('Payout Successful', { description: `Transaction: ${hash}` })
        }
    }, [isPending, hash, isSuccess])

    const avatar = userDetails?.avatar ?? blo(participantId)
    const displayName = userDetails?.displayName ?? formatAddress(participantId)
    const { data: participants, isLoading, error } = useParticipants(params?.['pool-id'])

    const currentParticipant = participants?.find(participant => participant.address === params['participant-id'])
    const isCheckedIn = currentParticipant?.checkedInAt != null

    if (isAdminLoading) {
        return null
    }

    if (!isAdmin) {
        return <div className={'mt-4 w-full text-center'}>You are not authorized to create a payout.</div>
    }

    return (
        <PageWrapper topBarProps={{ title: 'Payout', backButton: true }}>
            <div className='mx-auto flex max-w-md overflow-hidden rounded-lg bg-white'>
                <div className='mt-6 flex flex-col items-center'>
                    <Avatar className='size-[73px]' aria-label='User Avatar'>
                        <AvatarImage alt='User Avatar' src={avatar} />
                        <AvatarFallback className='bg-[#d9d9d9]' />
                    </Avatar>
                    <div className='flex flex-row'>
                        <h3 className='flex h-10 flex-1 flex-row items-center justify-center font-semibold'>
                            {displayName}
                        </h3>
                    </div>
                    <div className='flex flex-row justify-center'>
                        {isCheckedIn ? (
                            <p className='font-medium text-[#6993FF]'>Checked in</p>
                        ) : (
                            <p className='text-[#B2B2B2]'>Registered</p>
                        )}
                    </div>
                    <PayoutForm
                        poolId={params['pool-id']}
                        participantId={params['participant-id']}
                        tokenAddress={tokenAddress}
                    />
                </div>
            </div>
        </PageWrapper>
    )
}

export default ParticipantPayout
