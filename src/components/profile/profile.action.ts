'use server'

import { createServiceClient } from '@/lib/server/db'
import { revalidatePath } from 'next/cache'

const supabase = createServiceClient()

export async function handleUserAuthentication(privyId: string, walletAddress: string, isNewPrivyUser: boolean) {
    console.log('handleUserAuthentication called with:', { privyId, walletAddress, isNewPrivyUser })
    try {
        const result = await createOrUpdateUser(privyId, walletAddress)
        console.log('createOrUpdateUser result:', result)
        const { user, isNewUser } = result

        if (isNewUser || isNewPrivyUser) {
            return { redirect: '/participant/new', user }
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
    console.log('Supabase instance:')
    const response = await supabase.from('users').select().eq('privyId', privyId).single()

    if (!response) {
        throw new Error('Unexpected null response from Supabase')
    }
    console.log('Supabase response:', response)
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
            .single()

        if (insertError) throw insertError
        revalidatePath('/')
        return { isNewUser: true, user: newUser }
    }
}

export async function updateUserProfile(privyId: string, displayName: string, avatarUrl: string | null) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ displayName, avatar: avatarUrl })
            .eq('privyId', privyId)
            .single()

        if (error) throw error

        revalidatePath('/')
        return data
    } catch (error) {
        console.error('Error in updateUserProfile:', error)
        throw error
    }
}
