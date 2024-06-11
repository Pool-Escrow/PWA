import { fetchLatestPoolId } from '@/lib/api/clientAPI'
import { getUser, verifyToken } from '@/lib/server'
import { WalletWithMetadata } from '@privy-io/react-auth'
import { createClient } from '@supabase/supabase-js'
import { decode } from 'jsonwebtoken'
import * as _ from 'lodash'
import type { NextApiRequest, NextApiResponse } from 'next'

const prepareBase64DataUrl = (base64: string) =>
	base64
		.replace('data:image/jpeg;', 'data:image/jpeg;charset=utf-8;')
		.replace(/^.+,/, '')

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Parse the request body
	const requestData = await req.body

	const {
		fileName,
		fileType,
		fileBase64,
		timeStart,
		timeEnd,
		poolName,
		description,
		price,
		softCap,
		penalty,
		tokenAddr,
		host,
		coHosts,
		termsUrl,
		jwtString,
	} = requestData

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

	try {
		const claims = await verifyToken(jwtString as string)
		const user = await getUser(claims!.userId)
		console.log('user', user)
		const walletWithMetadata = user?.linkedAccounts[0] as WalletWithMetadata
		jwtAddress = walletWithMetadata?.address?.toLowerCase()
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Failed to decode Jwt.' })
		return
	}

	const jwtObj = decode(jwtString, { json: true })
	let imagePath: any = null
	if (!_.isEmpty(fileName)) {
		const { data, error } = await supabaseAdminClient.storage
			.from('pool')
			.upload(
				// `/public/${}/${Date.now()}-${selectedFile?.name}`,
				`/public/${jwtObj?.sub}/${Date.now()}-${fileName}`,
				// base64,
				Buffer.from(prepareBase64DataUrl(fileBase64), 'base64'),
				{ contentType: fileType },
			)
		if (error) {
			console.error('Error uploading image:', error.message)
			res.status(500).json({ error: 'Failed to upload pool.' })
			return
		}
		imagePath = data?.path
		console.log('imagePath', imagePath)
	}

	const latestPoolId = await fetchLatestPoolId({ queryKey: [''] })
	console.log('latestPoolId', latestPoolId)
	const { data: poolData, error: poolError } = await supabaseAdminClient
		.from('pool')
		.insert({
			pool_id: latestPoolId?.toString(),
			created_by: jwtAddress,
			pool_image_url: imagePath,
			pool_name: poolName,
			host_address: host.toLowerCase(),
			co_host_addresses: coHosts,
			event_timestamp: new Date(timeStart * 1000).toISOString(),
			description: description,
			price: price,
			soft_cap: softCap,
			link_to_rules: termsUrl,
			participant_count: 0,
		})

	if (poolError) {
		console.error('Error updating user data:', poolError.message)
		res.status(500).json({ error: 'Failed to update user data.' })
		return
	}

	console.log('Pool created successfully')
	res.status(200).json({ message: 'Success' })
}
