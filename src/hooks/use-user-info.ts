import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { blo } from 'blo'
import { Address } from 'viem'
import { getSupabaseBrowserClient } from '@/app/(pages)/pool/[pool-id]/participants/_components/db-client'

const fetchUserInfo = async (privyId?: string) => {
    if (!privyId) return null

    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.from('users').select('avatar, displayName').eq('privyId', privyId).maybeSingle()

    return data ?? null
}

export const useUserInfo = () => {
    const { user } = usePrivy()

    return useQuery({
        queryKey: ['user-info', user?.id],
        queryFn: async () => await fetchUserInfo(user?.id),
        enabled: Boolean(user?.id),
        select: data => {
            const address = user?.wallet?.address as Address | undefined
            const avatarFallback = address && blo(address)
            return {
                avatar: data?.avatar ?? avatarFallback,
                displayName: data?.displayName,
            }
        },
    })
}
