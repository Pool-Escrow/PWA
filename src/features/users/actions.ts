'use server'

import { PrivyClient } from '@privy-io/server-auth'
import { hasRole } from '@/lib/contract/pool'
import { ADMIN_ROLE } from '@/lib/contract/constants'
import { Address } from 'viem'
import { cookies } from 'next/headers'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const privyAppSecret = process.env.PRIVY_APP_SECRET

if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy app ID or app secret')
}

const privy = new PrivyClient(privyAppId, privyAppSecret)

async function checkAdminStatus(token: string): Promise<boolean> {
    try {
        const verifiedClaims = await privy.verifyAuthToken(token)
        const userId = verifiedClaims.userId
        console.log('[checkAdminStatus] Token verified for user:', userId)

        const user = await privy.getUser(userId)
        const address = user.wallet?.address as Address | undefined

        if (!address) {
            console.log('[checkAdminStatus] User has no address:', userId)
            return false
        }

        const isAdmin = (await hasRole(ADMIN_ROLE, address)) ?? false
        console.log('[checkAdminStatus]', address, 'isAdmin?', isAdmin)
        return isAdmin
    } catch (error: any) {
        console.error('[checkAdminStatus] Error checking admin status:', error)
        if (error.message === 'invalid auth token') {
            throw new Error('INVALID_AUTH_TOKEN')
        }
        return false
    }
}

export async function getUserAdminStatusActionWithCookie(): Promise<boolean> {
    console.log('[getUserAdminStatusActionWithCookie] Checking admin status')

    const cookieStore = cookies()
    const token = cookieStore.get('privy-token')?.value

    if (!token) {
        console.log('[getUserAdminStatusActionWithCookie] No auth token provided')
        return false
    }

    return checkAdminStatus(token)
}

export async function getUserAdminStatusActionWithToken(token: string): Promise<boolean> {
    return checkAdminStatus(token)
}
