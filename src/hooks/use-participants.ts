import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { fetchWinnerDetail } from '@/app/(pages)/pool/[pool-id]/participants/_components/fetch-winner-detail'
import { usePoolDetails } from '@/app/(pages)/pool/[pool-id]/ticket/_components/use-pool-details'
import { formatAddress } from '@/app/_lib/utils/addresses'
import { useQuery } from '@tanstack/react-query'
import { blo } from 'blo'
import type { Address } from 'viem'

interface UserDetails {
    avatar: string | null
    displayName: string | null
    walletAddress: string
}

interface ParticipantStatus {
    status: string
    checked_in_at: string | null
    users: UserDetails | null
}

interface Participant {
    address: Address
    avatar: string
    displayName: string
    checkedInAt: string | undefined | null
    amountWon: number
    amountClaimed: number
}

const fetchUserDetails = async (address: Address) => {
    console.log('-- fetchUserDetails --- ')
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
        .from('users')
        .select('id, avatar, displayName, walletAddress')
        .eq('walletAddress', address)
        .single()
    return data
}

const fetchPoolParticipants = async (userId: number, poolId: string) => {
    console.log('-- fetchPoolParticipants --- ')
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
        .from('pool_participants')
        .select('user_id, pool_id, checked_in_at, status')
        .eq('user_id', userId)
        .eq('pool_id', poolId)
        .maybeSingle()

    if (error) {
        console.error(error)
    }
    return data
}

export const useParticipants = (poolId: string) => {
    const { poolDetails } = usePoolDetails(poolId)
    console.log('-- useParticipants --- ')
    return useQuery({
        queryKey: ['participants', poolId],
        queryFn: async () => {
            const participants = poolDetails?.poolDetailFromSC?.[5] || []

            const participantDetails: Participant[] = await Promise.all(
                participants.map(async (address: Address) => {
                    const userDetails = await fetchUserDetails(address)
                    // const participantStatus = await fetchPoolParticipants(userDetails?.id, poolId)
                    const winnerDetails = await fetchWinnerDetail({
                        queryKey: ['fetchWinnerDetail', BigInt(poolId), address],
                    })
                    let amountWon = winnerDetails.winnerDetailFromSC.amountWon
                    let amountClaimed = winnerDetails.winnerDetailFromSC.amountClaimed

                    let checkedInAt = undefined
                    let status = undefined
                    if (userDetails && userDetails.id) {
                        const poolParticipants = await fetchPoolParticipants(userDetails.id, poolId)
                        checkedInAt = poolParticipants?.['checked_in_at']
                        status = poolParticipants?.status
                    }

                    return {
                        address,
                        avatar: userDetails?.avatar ?? blo(address || '0x'),
                        displayName: userDetails?.displayName ?? formatAddress(address),
                        status: status || 'JOINED',
                        checkedInAt: checkedInAt,
                        amountWon: Number(amountWon),
                        amountClaimed: Number(amountClaimed),
                    }
                }),
            )

            return participantDetails
        },
        enabled: Boolean(poolDetails),
    })
}
