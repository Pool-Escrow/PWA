import { useQuery } from '@tanstack/react-query'
import { formatAddress } from '@/app/_lib/utils/addresses'
import frog from '@/public/app/images/frog.png'
import type { Address } from 'viem'
import { usePoolDetails } from '@/app/(pages)/pool/[pool-id]/ticket/_components/use-pool-details'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'
import { QueryData } from '@supabase/supabase-js'

interface Participant {
    address: Address
    avatar: string
    displayName: string
    status: string
    checkedInAt: string | null
}

const fetchUserDetails = async (address: Address) => {
    const supabase = getSupabaseBrowserClient()

    const participantsStatusQuery = supabase
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
        .single()

    type PoolParticipantsWithUsers = QueryData<typeof participantsStatusQuery>
    const { data, error } = await participantsStatusQuery
    if (error) {
        throw error
    }
    const participantsStatus: PoolParticipantsWithUsers = data

    return participantsStatus
}

export const useParticipants = (poolId: string) => {
    const { poolDetails } = usePoolDetails(BigInt(poolId))

    return useQuery({
        queryKey: ['participants', poolId],
        queryFn: async () => {
            const participants = poolDetails?.poolDetailFromSC?.[5] || []
            const participantDetails: Participant[] = await Promise.all(
                participants.map(async (address: Address) => {
                    const { status, checked_in_at, users: userDetails } = await fetchUserDetails(address)
                    return {
                        address,
                        avatar: userDetails?.avatar || frog.src,
                        displayName: userDetails?.displayName ?? formatAddress(userDetails?.walletAddress || '0x'),
                        status: status || 'JOINED',
                        checkedInAt: checked_in_at || null,
                    }
                }),
            )
            return participantDetails
        },
        enabled: Boolean(poolDetails),
    })
}
