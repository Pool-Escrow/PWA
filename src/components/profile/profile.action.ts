// src/components/profile/profile.action.ts
'use server'

import { createServiceClient } from '@/lib/server/db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { PrivyClient } from '@privy-io/server-auth'
import { Database } from '@/types/db'

const supabase = createServiceClient()
const privyClient = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID!, process.env.PRIVY_APP_SECRET!)

type ProfileUpdate = Pick<Database['public']['Tables']['users']['Update'], 'displayName' | 'avatar'>

export async function handleUserAuthentication(privyId: string, walletAddress: string, isNewPrivyUser: boolean) {
    console.log('handleUserAuthentication called with:', { privyId, walletAddress, isNewPrivyUser })
    try {
        const result = await createOrUpdateUser(privyId, walletAddress)
        console.log('createOrUpdateUser result:', result)
        const { user, isNewUser } = result

        if (isNewUser || isNewPrivyUser) {
            return { redirect: '/profile/new', user }
        } else {
            return { redirect: '/', user }
        }
    } catch (error) {
        console.error('Error in handleUserAuthentication:', error)
        throw error
    }
}

export async function createOrUpdateUser(privyId: string, walletAddress: string) {
    console.log('createOrUpdateUser called with:', { privyId, walletAddress })
    const response = await supabase.from('users').select().eq('privyId', privyId).single()

    if (!response) {
        throw new Error('Unexpected null response from Supabase')
    }
    console.log('Supabase response successful for ', response.data?.displayName)
    const { data: existingUser, error: fetchError } = response

    if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
    }

    if (existingUser) {
        if (existingUser.walletAddress !== walletAddress) {
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({ walletAddress })
                .eq('privyId', privyId)
                .select('*')
                .single()

            if (updateError) throw updateError
            revalidatePath('/')
            return { isNewUser: false, user: updatedUser }
        }
        return { isNewUser: false, user: existingUser }
    } else {
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                privyId,
                walletAddress,
                role: 'user',
            })
            .select('*')
            .single()

        if (insertError) throw insertError
        revalidatePath('/')
        return { isNewUser: true, user: newUser }
    }
}

export async function updateUserProfile(profileData: ProfileUpdate) {
    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!privyAuthToken) {
        throw new Error('Unauthorized. Missing or expired auth token.')
    }

    try {
        const verifiedClaim = await privyClient.verifyAuthToken(privyAuthToken)
        const privyId = verifiedClaim.userId

        const { data, error } = await supabase
            .from('users')
            .update({
                displayName: profileData.displayName,
                avatar: profileData.avatar,
                updatedAt: new Date().toISOString(),
            })
            .eq('privyId', privyId)
            .select()
            .single()

        if (error) throw error

        revalidatePath('/')
        return data
    } catch (error) {
        console.error('Error in updateUserProfile:', error)
        throw error
    }
}

export async function getUserProfile() {
    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!privyAuthToken) {
        throw new Error('Unauthorized. Missing or expired auth token.')
    }

    try {
        const verifiedClaim = await privyClient.verifyAuthToken(privyAuthToken)
        const privyId = verifiedClaim.userId

        const { data, error } = await supabase.from('users').select().eq('privyId', privyId).single()

        if (error) throw error

        return data
    } catch (error) {
        console.error('Error in getUserProfile:', error)
        throw error
    }
}
