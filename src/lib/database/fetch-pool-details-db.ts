import { getSupabaseBrowserClient } from '@/lib/database/client'
import { PostgrestSingleResponse } from '@supabase/supabase-js'
import * as lodash from 'lodash'

const supabaseBrowserClient = getSupabaseBrowserClient()

export const fetchPoolDetailsFromDB = async ({ queryKey }: { queryKey: [string, bigint, number] }) => {
    console.log('fetchPoolDataFromDB')
    const [_, poolId] = queryKey
    const { data, error }: PostgrestSingleResponse<any[]> = await supabaseBrowserClient
        .from('pool') // Replace 'your_table_name' with your actual table name
        .select()
        .eq('pool_id', poolId)

    if (error) {
        // console.error('Error fetchPoolDataFromDB:', error.message)
        return {}
    }

    console.log('Pool data', JSON.stringify(data))
    if (data.length == 0) {
        // console.log('No Such Pool')
        // console.error('Error fetchPoolDataFromDB:')

        return {}
    }

    console.log('fetchPoolDataFromDB: Fetching Pool Image Url')

    let poolImageUrl = null
    console.log('pool_image_url', data[0].pool_image_url)
    if (!lodash.isEmpty(data[0].pool_image_url)) {
        const { data: storageData } = supabaseBrowserClient.storage.from('pool').getPublicUrl(data[0].pool_image_url)
        poolImageUrl = storageData.publicUrl
        console.log('poolImageUrl', storageData.publicUrl)
    }

    // console.log('fetchPoolDataFromDB: Fetching cohostUserDisplayData')

    let cohostUserDisplayData
    if (data[0]?.co_host_addresses?.length > 0) {
        const cohostDisplayData = await fetchUserDisplayInfoFromServer(data[0]?.co_host_addresses)
        cohostUserDisplayData = cohostDisplayData
    }
    // console.log('fetchPoolDataFromDB return')

    return {
        poolDBInfo: data[0],
        poolImageUrl,
        cohostUserDisplayData,
    }
}

export const fetchUserDisplayInfoFromServer = async (addressList: string[]) => {
    console.log('addressList', addressList)
    const lowerAddressList = addressList.map(address => address?.toLowerCase())
    const { data, error }: PostgrestSingleResponse<any[]> = await supabaseBrowserClient
        .from('usersDisplay')
        .select()
        .in('address', lowerAddressList)

    if (error) {
        console.error('Error reading data:', error)
        return
    } else {
        console.log('fetchUserDisplayInfoFromServer data:', data)
        return data
    }
}
