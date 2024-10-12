import { useQuery } from '@tanstack/react-query'
import { formatAddress } from '@/app/_lib/utils/addresses'
import frog from '@/public/app/images/frog.png'
import type { Address } from 'viem'
import { usePoolDetails } from '@/app/(pages)/pool/[pool-id]/ticket/_components/use-pool-details'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { fetchWinnerDetail } from '@/app/(pages)/pool/[pool-id]/participants/_components/fetch-winner-detail'

interface Participant {
    address: Address
    avatar: string
    displayName: string
    checkedInAt: string | undefined | null
    wonAmount: number
}

const fetchUserDetails = async (address: Address) => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
        .from('users')
        .select('id, avatar, displayName, walletAddress')
        .eq('walletAddress', address)
        .single()
    return data
}

const fetchPoolParticipants = async (userId: number, poolId: string) => {
    const supabase = getSupabaseBrowserClient()
    console.log('poolId', poolId)
    console.log('userId', userId)
    const { data, error } = await supabase
        .from('pool_participants')
        .select('user_id, pool_id, checked_in_at')
        .eq('user_id', userId)
        .eq('pool_id', poolId)
        .single()
    // console.log('fetchPoolParticipants', data)
    if (error) {
        console.error('fetchPoolParticipants', error)
    }
    return data
}

export const useParticipants = (poolId: string) => {
    const { poolDetails } = usePoolDetails(BigInt(poolId))

    return useQuery({
        queryKey: ['participants', poolId],
        queryFn: async () => {
            const participants = poolDetails?.poolDetailFromSC?.[5] || []
            const participantDetails: Participant[] = await Promise.all(
                participants.map(async (address: Address) => {
                    const userDetails = await fetchUserDetails(address)
                    const winnerDetails = await fetchWinnerDetail({
                        queryKey: ['fetchWinnerDetail', BigInt(poolId), address],
                    })

                    let wonAmount = winnerDetails.winnerDetailFromSC.amountWon
                    console.log('userDetails', userDetails)
                    let checkedInAt = undefined
                    if (userDetails && userDetails.id) {
                        const poolParticipants = await fetchPoolParticipants(userDetails.id, poolId)
                        checkedInAt = poolParticipants?.['checked_in_at']
                    }

                    return {
                        address,
                        avatar: userDetails?.avatar || frog.src,
                        displayName: userDetails?.displayName ?? formatAddress(userDetails?.walletAddress || '0x'),
                        checkedInAt: checkedInAt,
                        wonAmount: Number(wonAmount),
                    }
                }),
            )
            const wonAmount = poolDetails?.poolDetailFromSC?.[6] || []

            return participantDetails
        },
        enabled: Boolean(poolDetails),
    })
}
