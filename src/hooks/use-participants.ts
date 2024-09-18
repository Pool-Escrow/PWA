import { useQuery } from '@tanstack/react-query'
import { formatAddress } from '@/app/_lib/utils/addresses'
import frog from '@/public/app/images/frog.png'
import type { Address } from 'viem'
import { usePoolDetails } from '@/app/(pages)/pool/[pool-id]/ticket/_components/use-pool-details'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'

interface Participant {
    address: Address
    avatar: string
    displayName: string
}

const fetchUserDetails = async (address: Address) => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase
        .from('users')
        .select('avatar, displayName, walletAddress')
        .eq('walletAddress', address)
        .single()
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
                    return {
                        address,
                        avatar: userDetails?.avatar || frog.src,
                        displayName: userDetails?.displayName ?? formatAddress(userDetails?.walletAddress || '0x'),
                    }
                }),
            )
            return participantDetails
        },
        enabled: Boolean(poolDetails),
    })
}
