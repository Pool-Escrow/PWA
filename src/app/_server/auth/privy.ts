import 'server-only'

import { cookies } from 'next/headers'
import { PrivyClient } from '@privy-io/server-auth'

import type { User } from '@privy-io/server-auth'
import { Address } from 'viem'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const privyAppSecret = process.env.PRIVY_APP_SECRET

if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy app ID or app secret')
}
const privy = new PrivyClient(privyAppId, privyAppSecret)

const getPrivyVerificationKey = async () => {
    return process.env.PRIVY_VERIFICATION_KEY || (await privy.getVerificationKey())
}

export const verifyToken = async (): Promise<User | undefined> => {
    const accessToken = cookies().get('privy-token')?.value

    if (!accessToken) return

    try {
        const privyVerificationKey = await getPrivyVerificationKey()
        const verifiedClaims = await privy.verifyAuthToken(accessToken, privyVerificationKey)

        const user = await privy.getUser(verifiedClaims.userId)
        // todo: add a presenter for user data
        return user
    } catch (error) {
        console.error('error verifying token:', error)
    }
}

export const getUserWalletAddress = async (): Promise<Address | undefined> => {
    const user = await verifyToken()
    return user?.wallet?.address as Address | undefined
}
