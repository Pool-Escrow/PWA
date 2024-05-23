import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { JwtPayload, decode } from 'jsonwebtoken'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Parse the request body
	const requestData = await req.body
	const { poolId, address, jwtString } = requestData

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
		const jwtObj = decode(jwtString, { json: true })
		jwtAddress = jwtObj!.address
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Failed to decode Jwt.' })
		return
	}

	async function deleteData(pool_id: string, address: string) {
		const { data: poolData, error: poolDataError } = await supabaseAdminClient
			.from('pool')
			.select('*')
			.match({
				pool_id: pool_id,
			})

		if (
			poolData?.[0]?.['host_address'] != jwtAddress &&
			poolData?.[0]?.['co_host_addresses'].indexOf(jwtAddress) == -1
		) {
			console.error('Not authorised to save payouts')
			res.status(500).json({ message: 'Error' })

			return
		}
		console.log('Passed Delete Authorization Check')

		// Use supabase to delete the data
		const { data: deletedData, error: deleteError } = await supabaseAdminClient
			.from('participantStatus')
			.delete()
			.match({
				pool_id: pool_id,
				participant_address: address,
			})
		console.log('deletedData:', deletedData)

		if (deleteError) {
			console.log('Delete error:', deleteError.message)
			res.status(500).json({ message: 'Error: Failed to delete participant' })
		}
	}
	await deleteData(poolId, address.toLowerCase())

	res.status(200).json({ message: 'Success' })
}