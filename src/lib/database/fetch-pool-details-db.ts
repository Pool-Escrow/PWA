import { getSupabaseBrowserClient } from '@/lib/database/client'
import { Database } from '@/types/db'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

const supabaseBrowserClient = getSupabaseBrowserClient()

export type PoolRow = Database['public']['Tables']['pools']['Row']

export const fetchPoolDetailsFromDB = async ({ queryKey }: { queryKey: [string, bigint, number] }) => {
    // console.log('fetchPoolDataFromDB')
    const [_, poolId] = queryKey
    const { data, error }: PostgrestSingleResponse<PoolRow> = await supabaseBrowserClient
        .from('pools') // Replace 'your_table_name' with your actual table name
        .select()
        .eq('contract_id', poolId)
        .single()

    if (error) {
        // console.error('Error fetchPoolDataFromDB:', error.message)
        return {}
    }

    let poolImageUrl = data.bannerImage

    return {
        poolDBInfo: data,
        poolImageUrl,
    }
}
