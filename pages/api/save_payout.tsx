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
	const { poolId, winnerAddress, amount, jwtString } = requestData

	const walletAddressLower = winnerAddress.toLowerCase()
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
		// console.log('user', user)
		const walletWithMetadata = user?.linkedAccounts[0] as WalletWithMetadata
		jwtAddress = walletWithMetadata?.address?.toLowerCase()
		// console.log('address', jwtAddress)
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
		existingData?.[0]?.['co_host_addresses'] != null &&
		existingData?.[0]?.['co_host_addresses'].indexOf(jwtAddress) == -1
	) {
		console.error('Not authorised to save payouts')
		res.status(500).json({ message: 'Error' })

		return
	}

	async function upsertData() {
		const { data: existingData, error: selectError } = await supabaseAdminClient
			.from('savedPayouts')
			.select('*')
			.match({
				pool_id: poolId,
				address: winnerAddress,
			})

		if (existingData?.length === 0) {
			console.log('No previous user activity for pool', selectError)
			// Insert a new row
			const { data: insertedData, error: insertError } =
				await supabaseAdminClient.from('savedPayouts').insert({
					address: walletAddressLower,
					payout_amount: amount,
					pool_id: poolId,
				})
			if (insertError) {
				console.log('Error inserting into savedPayouts')
				res.status(500).json({ message: 'Error' })
			} else {
				console.log('Data inserted successfully:', insertedData)
			}
		} else {
			// Update the existing row
			const { data: updatedData, error: updateError } =
				await supabaseAdminClient
					.from('savedPayouts')
					.update({
						address: walletAddressLower,
						payout_amount: amount,
						pool_id: poolId,
					})
					.match({
						pool_id: poolId,
						address: walletAddressLower,
					})

			if (updateError) {
				console.error('Error updating data:', updateError)
				res.status(500).json({ error: 'Internal Server Error' })
			} else {
				console.log('Data updated successfully:', updatedData)
			}
		}
	}

	async function deleteData() {
		const { data: existingData, error: deleteError } = await supabaseAdminClient
			.from('savedPayouts')
			.delete()
			.match({
				pool_id: poolId,
				address: winnerAddress,
			})

		if (deleteError) {
			console.error(deleteError)
			res.status(500).json({ error: 'Internal Server Error' })
		}
	}

	if (amount == 0) {
		await deleteData()
	} else {
		await upsertData()
	}
	res.status(200).json({ message: 'Success' })
}
