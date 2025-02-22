'use client'

import PageWrapper from '@/components/page-wrapper'
import { useUserInfo } from '@/hooks/use-user-info'
import { useParams } from 'next/navigation'
import QRCode from 'react-qr-code'
import { usePoolDetails } from './_components/use-pool-details'

type Params = {
    'pool-id': string
}

const TicketPage = () => {
    const { 'pool-id': poolId } = useParams<Params>()

    const { poolDetails } = usePoolDetails(poolId)
    const { data: user } = useUserInfo()
    const address = user?.address

    if (!address) {
        window.history.back()
        return null
    }

    const hasJoined = poolDetails?.poolDetailFromSC?.[5]?.includes(address) ?? false
    return (
        <PageWrapper topBarProps={{ title: 'Ticket', backButton: true }}>
            <div className='flex w-full flex-col'>
                <h2 className='mb-8 text-center text-lg text-black'>{poolDetails?.poolDetailFromSC?.[1]?.poolName}</h2>
                <div className='flex w-full flex-1 flex-col items-center justify-center'>
                    {hasJoined ? (
                        <div className='cardBackground flex w-full max-w-lg rounded-3xl bg-[#F6F6F6] p-12'>
                            <QRCode
                                size={256}
                                style={{
                                    height: 'auto',
                                    maxWidth: '100%',
                                    width: '100%',
                                }}
                                value={JSON.stringify({ address, poolId })}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    ) : (
                        <div>You have not joined the pool</div>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export default TicketPage
