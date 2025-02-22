'use server'

import { getPrivyVerificationKey, privy } from '@/app/_server/auth/privy'
import { ADMIN_ROLE } from '@/lib/contract/constants'
import { hasRole } from '@/lib/contract/pool'
import { cookies } from 'next/headers'
import type { Address } from 'viem'

async function checkAdminStatus(token: string): Promise<boolean> {
    if (!token) return false

    try {
        const privyVerificationKey = await getPrivyVerificationKey()
        if (!privyVerificationKey) return false

        const verifiedClaims = await privy.verifyAuthToken(token, privyVerificationKey)
        if (!verifiedClaims?.userId) return false

        const user = await privy.getUser(verifiedClaims.userId)
        if (!user?.wallet?.address) return false

        return (await hasRole(ADMIN_ROLE, user.wallet.address as Address)) ?? false
    } catch {
        return false
    }
}

export async function getUserAdminStatusActionWithCookie(): Promise<boolean> {
    const cookieStore = await cookies()
    const token = cookieStore.get('privy-token')?.value
    if (!token) return false
    return checkAdminStatus(token)
}

export async function getUserAdminStatusActionWithToken(token: string): Promise<boolean> {
    return checkAdminStatus(token)
}
