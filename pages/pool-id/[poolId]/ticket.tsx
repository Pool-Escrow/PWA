import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import Appbar from '@/components/appbar'
import Page from '@/components/page'
import Section from '@/components/section'

import QRCode from 'react-qr-code'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import * as _ from 'lodash'

import { Database } from '@/types/supabase'

import { fetchAllPoolDataFromDB } from '@/lib/api/clientAPI'
import { useQuery } from '@tanstack/react-query'

export type PoolRow = Database['public']['Tables']['pool']['Row']
export type UserDisplayRow = Database['public']['Tables']['usersDisplay']['Row']

const TicketPage = () => {
	const router = useRouter()

	const { ready, authenticated, user } = usePrivy()

	const { wallets } = useWallets()

	const [poolDbData, setPoolDbData] = useState<any | undefined>()

	const [, setPageUrl] = useState('')

	const poolId = router?.query?.poolId

	const { data: poolDBInfo } = useQuery({
		queryKey: ['fetchAllPoolDataFromDB', poolId?.toString() ?? ' '],
		queryFn: fetchAllPoolDataFromDB,
		enabled: Boolean(poolId),
	})

	useEffect(() => {
		// Update the document title using the browser API
		if (ready && authenticated) {
			const walletAddress = user!.wallet!.address
			console.log(`Wallet Address ${walletAddress}`)
		}

		setPoolDbData(poolDBInfo?.poolDBInfo)

		console.log('poolDBInfo', poolDBInfo)
		setPageUrl(window?.location.href)
	}, [ready, authenticated, poolDBInfo, user])

	const parentRoute = useMemo(() => {
		const paths = router.asPath.split('/')
		paths.pop() // Remove the last sub-route
		return paths.join('/')
	}, [router.asPath])

	return (
		<Page>
			<Appbar backRoute={`${parentRoute}`} pageTitle='Ticket' />

			<Section>
				<div className='flex flex-col w-full '>
					<div className='relative flex flex-col pt-16 w-full min-h-screen space-y-0 pb-20 md:pb-24 justify-start'>
						<h2 className='text-center text-2xl'>{poolDbData?.pool_name}</h2>
						<div className='flex flex-1 flex-col w-full justify-center items-center'>
							<div className='rounded-3xl flex w-full cardBackground p-12 max-w-lg'>
								{!_.isEmpty(wallets) && (
									<QRCode
										size={256}
										style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
										value={JSON.stringify({
											address: wallets?.[0]?.address,
											poolId: poolId,
										})}
										viewBox={`0 0 256 256`}
									/>
								)}
							</div>
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}

export default TicketPage
