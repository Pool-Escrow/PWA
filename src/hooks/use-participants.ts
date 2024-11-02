import { useQuery } from '@tanstack/react-query'
import { formatAddress } from '@/app/_lib/utils/addresses'
import type { Address } from 'viem'
import { usePoolDetails } from '@/app/(pages)/pool/[pool-id]/ticket/_components/use-pool-details'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { fetchWinnerDetail } from '@/app/(pages)/pool/[pool-id]/participants/_components/fetch-winner-detail'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { blo } from 'blo'

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

    return useQuery({
        queryKey: ['participants', poolId],
        queryFn: async () => {
            const participants = poolDetails?.poolDetailFromSC?.[5] || []

            console.log('participants', poolId, participants)

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
            console.log('participantDetails', participantDetails)

            return participantDetails
        },
        enabled: Boolean(poolDetails),
    })
}
