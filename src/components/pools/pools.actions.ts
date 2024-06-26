// src/components/pools/pools.actions.ts

'use server'

import { createServiceClient } from '@/lib/server/db'

export const fetchPoolsFromDb = async (): Promise<PoolFromDb[]> => {
    const supabase = createServiceClient()

    const { data: pools, error } = await supabase.from('pools').select('*')

    if (error) {
        throw error
    }

    return pools
}
