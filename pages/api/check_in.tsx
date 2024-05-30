import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PrivyClient } from '@privy-io/server-auth'
import { getUser, verifyToken } from '@/lib/server'
import { WalletWithMetadata } from '@privy-io/react-auth'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Parse the request body
	const requestData = await req.body
	const { poolId, address, jwtString } = requestData

	const walletAddressLower = address.toLowerCase()
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
		const walletWithMetadata = user?.linkedAccounts[0] as WalletWithMetadata
		jwtAddress = walletWithMetadata?.address?.toLowerCase()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Failed to decode Jwt.' })
		return
	}

	const { data: existingData, error: selectError } = await supabaseAdminClient
		.from('pool')
		.select('*')
		.match({
			pool_id: poolId,
		})

	if (
		existingData?.[0]?.['host_address'] != jwtAddress &&
		existingData?.[0]?.['co_host_addresses'].indexOf(jwtAddress) == -1
	) {
		console.error('Not authorised to register')
		res.status(500).json({ message: 'Error' })

		return
	}

	async function upsertData() {
		const { data: existingData, error: selectError } = await supabaseAdminClient
			.from('participantStatus')
			.select('*')
			.match({
				pool_id: poolId,
				participant_address: walletAddressLower,
			})

		if (existingData?.length === 0) {
			console.log('User not Registered previously', selectError)
			// Insert a new row
			// const { data: insertedData, error: insertError } =
			// 	await supabaseAdminClient.from('participantStatus').insert({
			// 		participant_address: walletAddressLower,
			// 		status: 2,
			// 		pool_id: poolId,
			// 	})
			// if (insertError) {
			// 	console.log('Error inserting into participantStatus')
			// 	res.status(500).json({ message: 'Error' })
			// } else {
			// 	console.log('Data inserted successfully:', insertedData)
			// }
			res.status(500).json({ error: 'Internal Server Error' })
		} else {
			// Update the existing row
			const { data: updatedData, error: updateError } =
				await supabaseAdminClient
					.from('participantStatus')
					.update({
						participant_address: walletAddressLower,
						status: 2,
						pool_id: poolId,
						check_in_time: new Date(),
					})
					.match({
						pool_id: poolId,
						participant_address: walletAddressLower,
					})

			if (updateError) {
				console.error('Error updating data:', updateError)
				res.status(500).json({ error: 'Internal Server Error' })
			} else {
				console.log('Data updated successfully:', updatedData)
			}
		}
	}

	await upsertData()
	res.status(200).json({ message: 'Success' })
}
