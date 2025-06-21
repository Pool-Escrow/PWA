'use server'

import { hasRole } from '@/lib/contract/pool'
import { ADMIN_ROLE } from '@/lib/contract/constants'
import type { Address } from 'viem'
import { cookies } from 'next/headers'
import { privy, getPrivyVerificationKey } from '@/app/_server/auth/privy'

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
    const token = cookies().get('privy-token')?.value
    if (!token) return false
    return checkAdminStatus(token)
}

export async function getUserAdminStatusActionWithToken(token: string): Promise<boolean> {
    return checkAdminStatus(token)
}
