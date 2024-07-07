import { getSupabaseBrowserClient } from '@/lib/database/client'
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'

import { Database } from '@/types/db'

const supabaseBrowserClient = getSupabaseBrowserClient()
type UserRow = Database['public']['Tables']['users']['Row']
export const fetchUsersDetailsFromDB = async ({ queryKey }: { queryKey: [string, readonly string[]] }) => {
    const [_, walletAddresses] = queryKey
    let usersDetail: UserRow[] = []

    // For loop over walletAddresses
    for (let i = 0; i < walletAddresses.length; i++) {
        const { data, error }: PostgrestSingleResponse<UserRow> = await supabaseBrowserClient
            .from('users') // Replace 'your_table_name' with your actual table name
            .select()
            .like('walletAddress', `%${walletAddresses?.[i]}%`)
            .single()

        if (!error) {
            usersDetail.push(data)
        }
    }

    // console.log('usersDetail Return', usersDetail)
    return { usersDetail }
}
