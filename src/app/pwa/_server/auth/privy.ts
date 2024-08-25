import 'server-only'

import { poolAbi } from '@/types/contracts'
import { PrivyClient } from '@privy-io/server-auth'
import { cookies } from 'next/headers'
import type { Address } from 'viem'
import { getAbiItem, keccak256, toHex } from 'viem'
import { currentPoolAddress, serverClient } from '../blockchain/server-config'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const privyAppSecret = process.env.PRIVY_APP_SECRET
const adminRole = keccak256(toHex('WHITELISTED_HOST'))

if (!privyAppId || !privyAppSecret) {
    throw new Error('Missing Privy app ID or app secret')
}

const privy = new PrivyClient(privyAppId, privyAppSecret)

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

export async function getWalletAddress(): Promise<Address | null> {
    try {
        const user = await getPrivyUser()
        return (user?.wallet?.address as Address) || null
    } catch (error) {
        console.error('[privy] Error getting user wallet address:', error)
        return null
    }
}

// TODO: check admin role against smart contract instead, or both
export async function isAdmin(address?: Address) {
    if (!address) return false
    try {
        const HasRoleFunction = getAbiItem({
            abi: poolAbi,
            name: 'hasRole',
        })

        const isWhitelisted = await serverClient.readContract({
            address: currentPoolAddress,
            abi: [HasRoleFunction],
            functionName: 'hasRole',
            args: [adminRole, address],
        })
        console.log('isWhitelisted', isWhitelisted)
        return Boolean(isWhitelisted)
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

export async function getPrivyUserClaim() {
    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!privyAuthToken) {
        return null
    }

    try {
        const userClaim = await privy.verifyAuthToken(privyAuthToken)
        return userClaim
    } catch (error) {
        console.error('[privy] token verification failed with error', error)
        return null
    }
}

export async function getPrivyUser() {
    const userClaim = await getPrivyUserClaim()
    if (!userClaim) {
        return null
    }

    try {
        return await privy.getUser(userClaim.userId)
    } catch (error) {
        console.error('[privy] Error getting user:', error)
        return null
    }
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

export async function getAuthStatus(): Promise<{
    isAuthenticated: boolean
    isAdmin: boolean
    address: Address | null
}> {
    const address = await getWalletAddress()
    const adminStatus = address ? await isAdmin(address) : false

    return {
        isAuthenticated: !!address,
        isAdmin: adminStatus,
        address,
    }
}
