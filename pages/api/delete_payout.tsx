import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { JwtPayload, decode } from 'jsonwebtoken'
import { getUser, verifyToken } from '@/lib/server'
import { WalletWithMetadata } from '@privy-io/react-auth'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Parse the request body
	const requestData = await req.body
	const { poolId, winnerAddresses, amounts, jwtString } = requestData

	console.log('jwt', JSON.stringify(jwtString))

	// Return a response
	const supabaseAdminClient = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		},
	)

	let jwtAddress: string = '0x'
	try {
		const claims = await verifyToken(jwtString)
		const user = await getUser(claims!.userId)
		console.log('user', user)
		const walletWithMetadata = user?.linkedAccounts[0] as WalletWithMetadata
		jwtAddress = walletWithMetadata?.address?.toLowerCase()
		console.log('address', jwtAddress)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Failed to decode Jwt.' })
		return
	}

	async function deleteData(pool_id: string, address: string, amount: number) {
		const { data: poolData, error: poolDataError } = await supabaseAdminClient
			.from('pool')
			.select('*')
			.match({
				pool_id: pool_id,
			})

		if (
			poolData?.[0]?.['host_address'] != jwtAddress &&
			poolData?.[0]?.['co_host_addresses'] != null &&
			poolData?.[0]?.['co_host_addresses'].indexOf(jwtAddress) == -1
		) {
			console.error('Not authorised to save payouts')
			res.status(500).json({ message: 'Error' })

			return
		}
		console.log('Passed Delete Authorization Check')

		// Use supabase to delete the data
		const { data: deletedData, error: deleteError } = await supabaseAdminClient
			.from('savedPayouts')
			.delete()
			.match({
				pool_id: pool_id,
				address: address,
				payout_amount: amount,
			})
		console.log('deletedData:', deletedData)

		if (deleteError) {
			console.log('Delete error:', deleteError.message)
		}
	}
	// Write for loop
	for (let i = 0; i < winnerAddresses.length; i++) {
		console.log(
			'Deleting payout for',
			poolId,
			winnerAddresses[i].toLowerCase(),
			amounts[i],
		)
		await deleteData(poolId, winnerAddresses[i].toLowerCase(), amounts[i])
	}

	res.status(200).json({ message: 'Success' })
}
