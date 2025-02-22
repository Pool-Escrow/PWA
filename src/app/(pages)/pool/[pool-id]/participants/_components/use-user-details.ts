import type { Tables } from '@/types/db'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { getSupabaseBrowserClient } from './db-client'

type UserDetails = Pick<Tables<'users'>, 'avatar' | 'displayName' | 'walletAddress'>

const fetchUserDetailsFromDB = async (address: Address): Promise<UserDetails | null> => {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
        .from('users')
        .select('avatar, displayName, walletAddress')
        .eq('walletAddress', address)
        .single()

    if (error) {
        console.error('Error fetching user details:', error)
        return null
    }

    return data
}

export const useUserDetails = (address: Address) => {
    return useQuery({
        queryKey: ['userDetails', address],
        queryFn: () => fetchUserDetailsFromDB(address),
        enabled: Boolean(address),
    })
}
