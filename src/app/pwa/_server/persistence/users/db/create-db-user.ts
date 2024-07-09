import 'server-only'

import type { Address } from 'viem'
import { db } from '../../../database/db'

interface UserInfo {
    walletAddress: Address
    role: 'admin' | 'user'
}

interface UserItem {
    privyId: string
    info: UserInfo
}

export async function createUserInDb({ privyId, info }: UserItem) {
    const { data: newUser, error } = await db
        .from('users')
        .insert({
            privyId: privyId,
            walletAddress: info.walletAddress,
            role: info.role,
        })
        .select('*')
        .single()

    if (error) {
        throw new Error(`Error creating user in database: ${error.message}`)
    }

    console.log('user created in db with privyId:', privyId, 'and walletAddress:', info.walletAddress)

    return newUser
}
