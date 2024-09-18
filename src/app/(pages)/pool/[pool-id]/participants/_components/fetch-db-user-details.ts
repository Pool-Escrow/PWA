import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import type { Database } from '@/types/db'
import { getSupabaseBrowserClient } from './db-client'

const supabaseBrowserClient = getSupabaseBrowserClient()
type UserRow = Database['public']['Tables']['users']['Row']
export const fetchUserDetailsFromDB = async ({ queryKey }: { queryKey: [string, string] }) => {
    console.log('fetchUserDetailsFromDB')

    const [_, walletAddress] = queryKey

    const { data, error }: PostgrestSingleResponse<UserRow> = await supabaseBrowserClient
        .from('users')
        .select()
        .like('walletAddress', `%${walletAddress}%`)
        .single()
    console.log('fetchUserDetailsFromDB', data)

    if (error) {
        console.error('Error fetchUserDetailsFromDB:', error.message)
        return {}
    }

    return { userDetail: data, error }
}
