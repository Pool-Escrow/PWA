import { getSupabaseBrowserClient } from '@/lib/database/client'
import { Database } from '@/types/db'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

const supabaseBrowserClient = getSupabaseBrowserClient()

export type PoolParticipantsRow = Database['public']['Tables']['pool_participants']['Row']

export const fetchPoolParticipantsFromDB = async ({ queryKey }: { queryKey: [string, bigint, number] }) => {
    console.log('fetchPoolDataFromDB')
    const [_, poolId] = queryKey
    const { data, error }: PostgrestSingleResponse<PoolParticipantsRow[]> = await supabaseBrowserClient
        .from('pool_participants') // Replace 'your_table_name' with your actual table name
        .select('*')
        .eq('pool_id', poolId)

    if (error) {
        // console.error('Error fetchPoolDataFromDB:', error.message)
        return {}
    }

    return {
        poolParticipantsDBInfo: data,
    }
}
