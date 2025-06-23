'use client'

import PageWrapper from '@/components/page-wrapper'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatAddress } from '@/lib/utils/addresses'
import { blo } from 'blo'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import PayOtherPlayerForm from './_components/pay-other-player-form'

const PayOtherPlayerPage = () => {
    const searchParams = useSearchParams()
    const address = searchParams.get('address') as Address
    const [userDetails, setUserDetails] = useState<{ avatar?: string; displayName?: string } | null>(null)

    // TODO: Replace with actual user details fetch
    useEffect(() => {
        if (address) {
            setUserDetails({
                avatar: blo(address),
                displayName: formatAddress(address),
            })
        }
    }, [address])

    if (!address) {
        return <div className={'mt-4 w-full text-center'}>Invalid address.</div>
    }

    const avatar = userDetails?.avatar ?? blo(address)
    const displayName = userDetails?.displayName ?? formatAddress(address)

    return (
        <PageWrapper topBarProps={{ title: 'Pay Participant', backButton: true }}>
            <div className='mx-auto flex w-full flex-col items-center'>
                <div className='mt-[50px] flex w-full flex-col items-center'>
                    <div>
                        <Avatar className='size-[73px]' aria-label='User Avatar'>
                            <AvatarImage alt='User Avatar' src={avatar} />
                            <AvatarFallback className='bg-[#d9d9d9]' />
                        </Avatar>
                    </div>
                    <div className='flex flex-row'>
                        <h3 className='flex h-10 flex-1 flex-row items-center justify-center font-semibold'>
                            {displayName}
                        </h3>
                    </div>
                    {/* <div className='flex flex-row justify-center'>
                        <p className='text-[#6993FF]'>Users name</p>
                    </div> */}

                    <PayOtherPlayerForm
                        recipientAddress={address}
                        // tokenAddress={currentTokenAddress}
                        avatar={avatar}
                        displayName={displayName}
                    />
                </div>
            </div>
        </PageWrapper>
    )
}

export default PayOtherPlayerPage
