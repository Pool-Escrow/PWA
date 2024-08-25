import 'server-only'

import type { User } from '@privy-io/server-auth'
import type { Address } from 'viem'
import { getPrivyUser, getWalletAddress, isAdmin } from './privy'
import { getUserUseCase } from '../use-cases/users/get-user'
import { createUserUseCase } from '../use-cases/users/create-user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

interface Session {
    id: string
    address: Address | null
    isAdmin: boolean
}

export const validateRequest = async (): Promise<{
    user: User | null
    session: Session | null
    needsRefresh: boolean
}> => {
    const privyUser = await getPrivyUser()

    if (!privyUser) {
        console.log('[auth] User not found, disconnected?')
        // TODO: remove any cookies or session data here
        return {
            user: null,
            session: null,
            needsRefresh: true,
        }
    }

    const id = privyUser.id
    const address = await getWalletAddress()
    if (!address) {
        console.log('[auth] User has no wallet address')
        throw new Error('User has no wallet address')
    }

    const adminStatus = address ? await isAdmin(address) : false

    console.log('[auth] User:', privyUser.id)

    // check if the user is in the database
    const user = await getUserUseCase(id)

    console.log('[auth] User in DB:', !!user)

    // if the user is not in the database, or they don't have username and avatar, create it and redirect to profile/new
    if (!user) {
        console.log('[auth] User not in DB')

        // create in database with empty random username and avatar

        const newUser = await createUserUseCase({
            privyId: id,
            info: {
                walletAddress: address,
                role: adminStatus ? 'admin' : 'user',
            },
        })

        if (!newUser) {
            console.log('[auth] Error creating user in DB')
            throw new Error('Error creating user in DB')
        }

        console.log('[auth] User created in DB:', newUser)
    }

    if (!user?.displayName || !user.avatar) {
        console.log('[auth] User has no display name or avatar')

        // redirect('/profile/new')
    }
    console.log('auth revalidatePath: ', '/pools')
    revalidatePath('/pools')
    console.log('auth return: ', {
        user: privyUser,
        session: {
            id,
            address,
            isAdmin: adminStatus,
        },
        needsRefresh: false,
    })
    return {
        user: privyUser,
        session: {
            id,
            address,
            isAdmin: adminStatus,
        },
        needsRefresh: false,
    }
}
