import 'server-only'

import type { Address } from 'viem'
import { db } from '../../../database/db'

interface UserInfo {
    walletAddress: Address
    role: 'admin' | 'user'
    displayName?: string | null
    avatar?: string | null
}

interface UserItem {
    privyId: string
    info: UserInfo
}

export async function createUserInDb({ privyId, info }: UserItem) {
    console.log('[createUserInDb]')
    const { data: newUser, error } = await db
        .from('users')
        .insert({
            privyId: privyId,
            walletAddress: info.walletAddress,
            role: info.role,
            displayName: info.displayName,
            avatar: info.avatar,
        })
        .select('*')
        .single()

    if (error) {
        console.error('Error creating user in database:', error)
        if (error.code === '23505') {
            console.error('User already exists in database')
            return
        }
        throw new Error(`Error creating user in database: ${error.message}`)
    }

    console.log('user created in db with privyId:', privyId, 'and walletAddress:', info.walletAddress)

    return newUser
}
