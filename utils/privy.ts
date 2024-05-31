import { PrivyClient } from '@privy-io/server-auth'
import { safeLoadEnv } from './environment'
import { createServiceClient } from './supabase/server'

const privyAppId = safeLoadEnv('NEXT_PUBLIC_PRIVY_APP_ID')
const privyAppSecret = safeLoadEnv('PRIVY_APP_SECRET')

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

export async function getWalletAddress(privyAuthToken: string) {
	const privyClient = new PrivyClient(privyAppId, privyAppSecret)

	const { userId } = await privyClient.verifyAuthToken(privyAuthToken)
	const user = await privyClient.getUser(userId)
	const wallet = user.wallet
	return wallet?.address
}
