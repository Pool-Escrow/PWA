import 'server-only'

import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

import type { User } from '@privy-io/server-auth'
import type { Address } from 'viem'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const privyAppSecret = process.env.PRIVY_APP_SECRET

if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy app ID or app secret')
}

export const privy = new PrivyClient(privyAppId, privyAppSecret)

export const getPrivyVerificationKey = async () => {
    return process.env.PRIVY_VERIFICATION_KEY || (await privy.getVerificationKey())
}

export const verifyToken = async (): Promise<User | undefined> => {
    try {
        // 1. Get the token from the cookies
        const cookieStore = await cookies()
        const accessToken = cookieStore.get('privy-token')?.value
        if (!accessToken) {
            console.log('No privy-token cookie found')
            return undefined
        }

        // 2. Get the verification key
        const privyVerificationKey = await getPrivyVerificationKey()
        if (!privyVerificationKey) {
            console.log('No verification key available')
            return undefined
        }

        // 3. Verify the token with privy.verifyAuthToken
        const verifiedClaims = await privy.verifyAuthToken(accessToken, privyVerificationKey)
        if (!verifiedClaims?.userId) {
            console.log('Invalid token claims')
            return undefined
        }

        // 4. Get the user using the verified token
        const user = await privy.getUser(verifiedClaims.userId)
        return user
    } catch (error) {
        console.error('Token verification failed:', error)
        return undefined
    }
}

export const getUserWalletAddress = async (): Promise<Address | undefined> => {
    const user = await verifyToken()
    return user?.wallet?.address as Address | undefined
}
