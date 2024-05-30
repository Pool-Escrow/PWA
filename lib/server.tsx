import { PrivyClient } from '@privy-io/server-auth'

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
