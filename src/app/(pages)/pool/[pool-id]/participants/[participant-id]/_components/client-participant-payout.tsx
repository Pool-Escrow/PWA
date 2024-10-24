'use client'

import { formatAddress } from '@/app/_lib/utils/addresses'
import frog from '@/public/app/images/frog.png'
import type { Address } from 'viem'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { useUserDetails } from '../../_components/use-user-details'
import { usePoolDetails } from '../../../ticket/_components/use-pool-details'
import { currentTokenAddress } from '@/app/_server/blockchain/server-config'
import PayoutForm from './payout-form'

function ClientParticipantPayout({ params }: { params: { 'pool-id': string; 'participant-id': Address } }) {
    const { data: userDetails } = useUserDetails(params['participant-id'])
    const { poolDetails } = usePoolDetails(BigInt(params?.['pool-id']))

    const tokenAddress = poolDetails?.poolDetailFromSC?.[4] ?? currentTokenAddress
    const avatar = userDetails?.avatar ?? frog.src
    const displayName = userDetails?.displayName ?? formatAddress(params['participant-id'])

    return (
        <div className='max-w-md self-center overflow-hidden rounded-lg bg-white'>
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
                <div className='mb-4 flex flex-row justify-center'>
                    <p>Checked in</p>
                </div>
                <PayoutForm
                    poolId={params['pool-id']}
                    participantId={params['participant-id']}
                    tokenAddress={tokenAddress}
                />
            </div>
        </div>
    )
}

export default ClientParticipantPayout
