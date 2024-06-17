import 'server-only'

import { getUser, verifyToken } from '@/lib/server/auth'
import { WalletWithMetadata } from '@privy-io/react-auth'
import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
	message: string
}

interface RequestData {
	name: string
	email: string
	// Add other properties as needed
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Parse the request body
	const requestData = await req.body
	const { display_name, bio, company, jwtString } = requestData

	console.log('jwt', JSON.stringify(jwtString))
	// Return a response
	const supabaseAdminClient = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	)

	let jwtAddress: string = '0x'
	let userId = ''

	try {
		const claims = await verifyToken(jwtString)
		const user = await getUser(claims!.userId)
		userId = claims!.userId
		console.log('user', user)
		const walletWithMetadata = user?.linkedAccounts[0] as WalletWithMetadata
		jwtAddress = walletWithMetadata?.address?.toLowerCase()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Failed to decode Jwt.' })
		return
	}

	async function upsertData() {
		// Update the existing row
		const { data: updatedData, error: updateError } = await supabaseAdminClient
			.from('usersDisplay')
			.update({ display_name, company, bio })
			.match({
				id: userId,
			})

		if (updateError) {
			console.error('Error updating data:', updateError)
			res.status(500).json({ error: 'Internal Server Error' })
		} else {
			console.log('Data updated successfully:', updatedData)
		}
	}

	await upsertData()
	res.status(200).json({ message: 'Success' })
}
