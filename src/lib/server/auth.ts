import 'server-only'

import { PrivyClient } from '@privy-io/server-auth'
import { createServiceClient } from './db'

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
const privyAppSecret = process.env.PRIVY_APP_SECRET

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

// TODO: check admin role against smart contract instead, or both
export async function isAdmin(address?: string) {
	if (!address) return false

	const supabase = createServiceClient()
	const { data, error } = await supabase
		.from('admin')
		.select()
		// wrapping with percent signs to allow for case-insensitive comparison
		.like('address', `%${address}%`)

	if (error) {
		console.error('Error fetching admin data:', error)
		return false
	}

	return data.length > 0
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
	return wallet?.address
}
