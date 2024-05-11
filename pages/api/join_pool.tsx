import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { hashMessage, recoverAddress, verifyMessage } from 'ethers'
import { createClient } from '@supabase/supabase-js'
import { JwtPayload, decode } from 'jsonwebtoken'

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
	const { poolId, walletAddress, jwtString } = requestData

	const walletAddressLower = walletAddress.toLowerCase()
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

	const supabaseRow = {
		participant_address: walletAddressLower,
		status: 1,
		pool_id: poolId,
		// Add other columns as needed
	}

	try {
		const jwtObj = decode(jwtString, { json: true })
		const jwtAddress = jwtObj!.address
		if (jwtAddress.toLowerCase() != walletAddress.toLowerCase()) {
			res.status(401).json({ error: 'Unauthorized' })
			return
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Invalid Jwt' })
		return
	}

	async function upsertData() {
		const { data: existingData, error: selectError } = await supabaseAdminClient
			.from('participantStatus')
			.select('*')
			.match({
				pool_id: supabaseRow.pool_id,
				participant_address: supabaseRow.participant_address,
			})

		if (existingData?.length === 0) {
			console.log('No previous user activity for pool', selectError)
			// Insert a new row
			const { data: insertedData, error: insertError } =
				await supabaseAdminClient
					.from('participantStatus')
					.insert([supabaseRow])

			if (insertError) {
				console.error('Error inserting data:', insertError)
			} else {
				console.log('Data inserted successfully:', insertedData)
			}
			res.status(500).json({ error: 'Internal Server Error' })

			return
		} else {
			console.log('existingData', JSON.stringify(existingData))
			if (existingData?.[0]['status'] == 1) {
				console.log('Already joined!')
				return
			}
			// Update the existing row
			const { data: updatedData, error: updateError } =
				await supabaseAdminClient
					.from('participantStatus')
					.update({ status: supabaseRow.status })
					.match({
						pool_id: supabaseRow.pool_id,
						participant_address: supabaseRow.participant_address,
					})

			if (updateError) {
				console.error('Error updating data:', updateError)
				res.status(500).json({ error: 'Internal Server Error' })
			} else {
				console.log('Data updated successfully:', updatedData)
			}
		}

		// Update the participant count
		const { data: participantCount, error: participantCountError } =
			await supabaseAdminClient
				.from('pool') // replace with your table name
				.select('participant_count')
				.eq('pool_id', poolId)

		if (participantCountError) {
			console.error('Error reading participant_count:', participantCountError)
			res.status(500).json({ error: 'Internal Server Error' })
		}
		console.log('participantCount', participantCount?.[0].participant_count)
		console.log('poolId', poolId)

		let count = participantCount?.[0].participant_count ?? 0
		const { data: updateData, error: updateParticipantCountError } =
			await supabaseAdminClient
				.from('pool') // replace with your table name
				.update({ participant_count: count + 1 })
				.match({
					pool_id: poolId,
				})
		if (updateParticipantCountError) {
			console.log(
				'Error updating participant count',
				participantCountError?.message,
			)
			res.status(500).json({ error: 'Internal Server Error' })
		} else {
			console.log('updateData', updateData)

			console.log('participant_count updated successfully')
		}
	}

	await upsertData()
	res.status(200).json({ message: 'Success' })
}
