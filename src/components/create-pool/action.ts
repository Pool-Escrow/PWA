'use server'

import { createServiceClient } from '@/lib/server/db'
import { isAdmin, getWalletAddress } from '@/lib/server/auth'
import { Database } from '@/types/db'
import { cookies } from 'next/headers'
import { parseISO } from 'date-fns'

type Pool = Database['public']['Tables']['pools']['Insert']

export async function createPoolAction(
    poolData: Omit<Pool, 'internal_id' | 'createdAt' | 'updatedAt' | 'contract_id' | 'status'>,
) {
    console.log('Creating pool', poolData)

    // Verify auth token
    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!privyAuthToken) {
        throw new Error('Unauthorized. Missing or expired auth token.')
    }

    const walletAddress = await getWalletAddress(privyAuthToken)
    console.log('Address:', walletAddress)

    if (!walletAddress || !(await isAdmin(walletAddress))) {
        throw new Error('Unauthorized')
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase
        .from('pools')
        .insert({
            name: 'man',
            description: 'wef',
            bannerImage: 'reff',
            termsURL: 'wdfwf',
            softCap: 50,
            startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            price: 50.5,
            tokenAddress: '0x1234567890',
            // contract_id: '50',
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
        .select('*')
        .single()

    if (error) {
        console.error('Error creating pool:', error)
        // todo: log the error to database
        throw error
    }

    // Add the creator as the main host
    if (data) {
        // First, find the connected user's ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('walletAddress', walletAddress)
            .single()

        if (userError) {
            console.error('Error finding user:', userError)
            throw userError
        }

        if (!userData) {
            throw new Error('User not found')
        }

        // Now insert into pool_participants using the found user ID
        const { error: participantError } = await supabase.from('pool_participants').insert({
            user_id: userData.id,
            pool_id: data.internal_id,
            poolRole: 'mainHost',
        })

        if (participantError) {
            console.error('Error adding participant:', participantError)
            throw participantError
        }
    }

    return data
}

export async function updatePoolStatus(
    poolId: string,
    status: 'draft' | 'unconfirmed' | 'inactive' | 'depositsEnabled' | 'started' | 'paused' | 'ended' | 'deleted',
) {
    const supabase = createServiceClient()
    console.log('updatePoolStatus poolId', poolId, 'status', status)
    const { error } = await supabase.from('pools').update({ status }).eq('internal_id', poolId)

    if (error) throw error
}
