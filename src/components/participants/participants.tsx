// src/components/pool-detail/pool-detail.tsx
'use client'

import frog from '@/../public/images/frog.png'
import { useAdmin } from '@/lib/hooks/use-admin'
import { usePoolDetails } from '@/lib/hooks/use-pool-details'
import { usePoolDetailsDB } from '@/lib/hooks/use-pool-details-db'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { useWallets } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useBalance } from 'wagmi'
import ParticipantRow from '../common/other/participantRow'

const avatarUrls = new Array(4).fill(frog.src)

interface PoolParticipantsProps {
    poolId: string
}
const Participants = (props: PoolParticipantsProps) => {
    const { poolDetails, isLoading, error } = usePoolDetails(BigInt(props.poolId))
    const {
        poolDetailsDB,
        isLoading: isLoadingPoolDetailsDB,
        error: poolDetailsDBError,
    } = usePoolDetailsDB(BigInt(props.poolId))

    const queryClient = useQueryClient()
    const poolSCStatus = poolDetails?.poolDetailFromSC?.[3]
    const { wallets } = useWallets()
    const { adminData } = useAdmin()
    const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
    const walletNativeBalance = useBalance({
        address: wallets[0]?.address as HexString,
    })
    const walletTokenBalance = useBalance({
        address: wallets[0]?.address as HexString,
        token: poolDetails?.poolDetailFromSC?.[4] as HexString,
    })

    const isRegisteredOnSC = poolDetails?.poolDetailFromSC?.[5]?.indexOf(wallets[0]?.address as HexString) !== -1
    const participants = poolDetails?.poolDetailFromSC?.[5]
    const { showBar, hideBar, setContent } = useBottomBarStore(state => state)

    useEffect(() => {
        hideBar()
    }, [hideBar])

    return (
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-lg'>
            <div className='p-4'>
                {participants?.map((participant, index) => {
                    return <ParticipantRow poolId={props.poolId} key={participant} address={participant} />
                })}
            </div>
        </div>
    )
}

export default Participants
