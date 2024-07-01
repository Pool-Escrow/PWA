import { getSupabaseBrowserClient } from '@/lib/database/client'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

import { Database } from '@/types/db'

const supabaseBrowserClient = getSupabaseBrowserClient()
type UserRow = Database['public']['Tables']['users']['Row']
export const fetchUserDetailsFromDB = async ({ queryKey }: { queryKey: [string, string] }) => {
    console.log('fetchUserDetailsFromDB')

    const [_, walletAddress] = queryKey

    const { data, error }: PostgrestSingleResponse<UserRow> = await supabaseBrowserClient
        .from('users') // Replace 'your_table_name' with your actual table name
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
