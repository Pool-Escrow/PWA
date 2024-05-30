import type { NextApiRequest, NextApiResponse } from 'next'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PrivyClient } from '@privy-io/server-auth'
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
	const { fileName, fileType, selectedFileBase64, jwtString } = requestData
	// const formData = await req.formData()
	const base64 = selectedFileBase64.split('base64,')[1]
	console.log('base64', base64)
	// const formData = await req.body

	// console.log('jwt', JSON.stringify(jwtString))
	console.log('fileName', fileName)
	console.log('fileType', fileType)

	// console.log('selectedFileBase64', selectedFileBase64)
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

	// let did = '0x'
	// if (jwtObj?.sub != null) {
	// 	did = jwtObj?.sub.split(':')[2]
	// }

	const jwtObj = decode(jwtString, { json: true })
	// console.log('jwtObj', jwtObj)
	// console.log('file name', fileBlob.name)
	// console.log('selectedFile', selectedFile)
	// console.log(
	// 	'filePath',
	// 	`/public/${jwtObj?.sub}/${Date.now()}-${selectedFile?.name}`,
	// )

	const { data, error } = await supabaseAdminClient.storage
		.from('profile')
		.upload(
			// `/public/${}/${Date.now()}-${selectedFile?.name}`,
			`/public/${jwtObj?.sub}/${Date.now()}-${fileName}`,
			// base64,
			Buffer.from(prepareBase64DataUrl(selectedFileBase64), 'base64'),
			{ contentType: fileType },
		)
	if (error) {
		console.error('Error uploading image:', error.message)
		return
	}
	const { data: userData, error: userError } = await supabaseAdminClient
		.from('usersDisplay')
		.upsert(
			{ avatar_url: data.path, id: jwtObj?.sub, address: jwtAddress },
			{
				onConflict: 'id',
			},
		)

	if (userError) {
		console.error('Error updating user data:', userError.message)
		res.status(500).json({ error: 'Failed to update user data.' })
	}

	console.log('usersDisplay updated successfully')
	res.status(200).json({ message: 'Success' })
}
