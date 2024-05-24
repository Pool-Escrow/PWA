import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import Appbar from '@/components/appbar'
import Page from '@/components/page'
import Section from '@/components/section'

import { usePrivy } from '@privy-io/react-auth'

import { Database } from '@/types/supabase'

import {
	fetchAllPoolDataFromDB,
	fetchAllPoolDataFromSC,
	fetchParticipantsDataFromServer,
} from '@/lib/api/clientAPI'
import { useQuery } from '@tanstack/react-query'

import ParticipantRow from '@/components/participantRow'

export type PoolRow = Database['public']['Tables']['pool']['Row']
export type UserDisplayRow = Database['public']['Tables']['usersDisplay']['Row']

const ParticipantsPage = () => {
	const router = useRouter()

	const { ready, authenticated } = usePrivy()

	const [, setPoolDbData] = useState<any>()

	const [, setPageUrl] = useState('')

	const poolId = router?.query?.poolId

	const { data: poolSCInfo } = useQuery({
		queryKey: ['fetchAllPoolDataFromSC', poolId?.toString() ?? ' '],
		queryFn: fetchAllPoolDataFromSC,
		enabled: !!poolId,
	})

	const { data: poolDBInfo } = useQuery({
		queryKey: ['fetchAllPoolDataFromDB', poolId?.toString() ?? ' '],
		queryFn: fetchAllPoolDataFromDB,
		enabled: !!poolId,
	})

	const poolSCParticipants = poolSCInfo?.[5]

	const { data: participantsInfo } = useQuery({
		queryKey: [
			'fetchUserDisplayInfoFromServer',
			poolId?.toString() ?? '0',
			poolSCParticipants,
		],
		queryFn: fetchParticipantsDataFromServer,
		enabled: poolSCParticipants?.length > 0 && poolId?.toString() != undefined,
	})

	useEffect(() => {
		setPoolDbData(poolDBInfo?.poolDBInfo)
		setPageUrl(window?.location.href)
	}, [ready, authenticated, poolSCInfo, poolDBInfo, participantsInfo])

	const parentRoute = useMemo(() => {
		const paths = router.asPath.split('/')
		paths.pop() // Remove the last sub-route
		return paths.join('/')
	}, [router.asPath])

	return (
		<Page>
			<Appbar backRoute={`${parentRoute}`} pageTitle='Participants' />

			<Section>
				<div className='flex w-full flex-col '>
					<div className='relative flex min-h-screen w-full flex-col justify-start space-y-0 pb-20 pt-16 md:pb-24'>
						{participantsInfo?.map((participant) => (
							<ParticipantRow
								key={participant?.id}
								name={participant?.display_name}
								participantStatus={participant?.participationData?.[0]?.status}
								imageUrl={participant?.avatar_url}
								address={participant?.address}
							/>
						))}
					</div>
				</div>
			</Section>
		</Page>
	)
}

export default ParticipantsPage
