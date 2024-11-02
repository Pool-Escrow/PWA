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
    // amountWon: number
    // amountClaimed: number
}

const fetchUserDetails = async (address: Address): Promise<ParticipantStatus | null> => {
    const supabase = getSupabaseBrowserClient()

    const { data, error }: PostgrestSingleResponse<ParticipantStatus> = await supabase
        .from('pool_participants')
        .select(
            `
            status,
            checked_in_at,
            users (
                avatar,
                displayName,
                walletAddress
            )
        `,
        )
        .eq('users.walletAddress', address)
        .limit(1)
        .single()

    if (error) {
        console.error(`Error fetching details for address ${address}:`, error)
        return null
    }

    return data
}

const fetchPoolParticipants = async (userId: number, poolId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
        .from('pool_participants')
        .select('user_id, pool_id, checked_in_at')
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
                    const participantStatus = await fetchUserDetails(address)
                    return {
                        address,
                        avatar: participantStatus?.users?.avatar ?? blo(address || '0x'),
                        displayName: participantStatus?.users?.displayName ?? formatAddress(address),
                        status: participantStatus?.status || 'JOINED',
                        checkedInAt: participantStatus?.checked_in_at || null,
                    }
                }),
            )

            return participantDetails
        },
        enabled: Boolean(poolDetails),
    })
}
