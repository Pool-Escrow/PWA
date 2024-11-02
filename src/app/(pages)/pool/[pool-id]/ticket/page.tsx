'use client'

import { useWallets } from '@privy-io/react-auth'
import QRCode from 'react-qr-code'
import type { Address } from 'viem'
import { usePoolDetails } from './_components/use-pool-details'
import { useAccount } from 'wagmi'
import PageWrapper from '@/components/page-wrapper'

const TicketPage = ({ params: { 'pool-id': poolId } }: { params: { 'pool-id': string } }) => {
    const { poolDetails } = usePoolDetails(poolId)
    const { address } = useAccount() as { address: Address }

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
