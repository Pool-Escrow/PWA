import 'server-only'

import { PrivyClient } from '@privy-io/server-auth'
// import { createServiceClient } from './db'
import { Address, createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { poolAbi, poolAddress } from '@/types/contracts'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const privyAppSecret = process.env.PRIVY_APP_SECRET
const adminRole = '0xe799c73ff785ac053943f5d98452f7fa0bcf54da67826fc217d6094dec75c5ee'

if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy app ID or app secret')
}

const privy = new PrivyClient(privyAppId, privyAppSecret)

const publicClient = createPublicClient({
    chain: baseSepolia, // TODO: adjust this properly for production
    transport: http(),
})

export async function verifyToken(token: string) {
    try {
        const userClaim = await privy.verifyAuthToken(token)
        console.log('[privy] token verified')
        return userClaim
    } catch (error) {
        console.error('[privy] token verification failed with error', error)
        return null
    }
}

// TODO: check admin role against smart contract instead, or both
export async function isAdmin(address?: Address) {
    if (!address) return false

    try {
        const isWhitelisted = await publicClient.readContract({
            address: poolAddress[publicClient.chain.id],
            abi: poolAbi,
            functionName: 'hasRole',
            args: [adminRole, address],
        })

        console.log('[auth] isAdmin', isWhitelisted)

        return isWhitelisted
    } catch (error) {
        console.error('Error checking admin status:', error)
        return false
    }

    // TODO: check if we want to verify admin status against the database
    // const supabase = createServiceClient()
    // const { data, error } = await supabase
    // 	.from('admin')
    // 	.select()
    // 	// wrapping with percent signs to allow for case-insensitive comparison
    // 	.like('address', `%${address}%`)

    // if (error) {
    // 	console.error('Error fetching admin data:', error)
    // 	return false
    // }

    // return data.length > 0
}

export async function getUser(did: string) {
    try {
        const user = await privy.getUser(did)
        console.log('[privy] token verified')
        return user
    } catch (error) {
        console.error('[privy] token verification failed with error', error)
        return null
    }
}

export async function getWalletAddress(privyAuthToken: string) {
    const { userId } = await privy.verifyAuthToken(privyAuthToken)
    const user = await privy.getUser(userId)
    const wallet = user.wallet
    return (wallet?.address as Address) || undefined
}
