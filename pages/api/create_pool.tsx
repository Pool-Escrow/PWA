import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUser, verifyToken } from '@/lib/server'
import { WalletWithMetadata } from '@privy-io/react-auth'
import { decode } from 'jsonwebtoken'

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
	const { fileName, fileType, selectedFileBase64, formValues, jwtString } =
		requestData

	const base64 = selectedFileBase64.split('base64,')[1]
	console.log('base64', base64)
	console.log('fileName', fileName)
	console.log('fileType', fileType)

	console.log('jwtString', jwtString)

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

	const { data, error } = await supabaseAdminClient.storage.from('pool').upload(
		// `/public/${}/${Date.now()}-${selectedFile?.name}`,
		`/public/${jwtObj?.sub}/${Date.now()}-${fileName}`,
		// base64,
		Buffer.from(prepareBase64DataUrl(selectedFileBase64), 'base64'),
		{ contentType: fileType },
	)
	if (error) {
		console.error('Error uploading image:', error.message)
		res.status(500).json({ error: 'Failed to upload pool.' })
	}
	const { data: userData, error: poolError } = await supabaseAdminClient
		.from('pool')
		.insert({
			created_by: jwtAddress,
			pool_image_url: data?.path,
			pool_name: formValues.name,
			host_address: formValues.mainHost,
			co_host_addresses: formValues.coHosts,
			event_timestamp: formValues.date,
			description: formValues.description,
			price: formValues.price,
			soft_cap: formValues.softCap,
			link_to_rules: formValues.termsUrl,
			participant_count: 0,
		})

	if (poolError) {
		console.error('Error updating user data:', poolError.message)
		res.status(500).json({ error: 'Failed to update user data.' })
	}

	console.log('Pool created successfully')
	res.status(200).json({ message: 'Success' })
}
