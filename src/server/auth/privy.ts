import 'server-only'

import { env, getServerEnv } from '@/env.mjs'
import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'

import type { User } from '@privy-io/server-auth'
import type { Address } from 'viem'

const privyAppId = env.NEXT_PUBLIC_PRIVY_APP_ID
const serverEnv = getServerEnv()
const privyAppSecret = serverEnv.PRIVY_APP_SECRET

if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy app ID or app secret')
}

export const privy = new PrivyClient(privyAppId, privyAppSecret)

// Cached verification key to avoid repeated network requests
let cachedVerificationKey: string | undefined

/**
 * Resolve the Privy verification key.
 *
 * 1. Use the `PRIVY_VERIFICATION_KEY` environment variable when it is present.
 * 2. Otherwise, fetch the key from Privy once per runtime and cache it.
 * 3. If fetching fails (e.g. network issues during local development),
 *    return `undefined` so that the caller can gracefully handle the failure
 *    without throwing un-handled exceptions that clutter the console.
 */
export const getPrivyVerificationKey = async (): Promise<string | undefined> => {
    // 1. Prefer the explicit env variable – it is the safest and cheapest path.
    if (serverEnv.PRIVY_VERIFICATION_KEY) {
        return serverEnv.PRIVY_VERIFICATION_KEY
    }

    // 2. If we have already fetched and cached the key, reuse it.
    if (cachedVerificationKey) {
        return cachedVerificationKey
    }

    // 3. Fetch from Privy and cache the result.  Wrap in try/catch to avoid
    //    noisy stack traces when the network request fails (common in dev).
    try {
        cachedVerificationKey = await privy.getVerificationKey()
        return cachedVerificationKey
    } catch (error) {
        // Log a concise message in development; suppress in production.
        if (process.env.NODE_ENV === 'development') {
            console.error('[getPrivyVerificationKey] Failed to fetch verification key:', error)
        }
        return undefined
    }
}

export const verifyToken = async (): Promise<User | undefined> => {
    try {
        // 1. Get the token from the cookies
        const accessToken = cookies().get('privy-token')?.value
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
