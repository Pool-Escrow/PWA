import { getAdminStatusAction } from '@/app/(pages)/pools/actions'
import Participants from './_components/participants'

export default async function ManageParticipantsPage({ params }: { params: { 'pool-id': string } }) {
    const isAdmin = await getAdminStatusAction()

    return (
        <div>
            <Participants poolId={params['pool-id']} isAdmin={isAdmin} />
        </div>
    )
}

// import { Input } from '@/components/ui/input'
// import { Progress } from '@/components/ui/progress'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { toast } from '@/components/ui/use-toast'
// import { usePrivy, useWallets } from '@privy-io/react-auth'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import { ethers } from 'ethers'
// import { SearchIcon } from 'lucide-react'
// import Link from 'next/link'
// import { useRouter } from 'next/router'
// import { ChangeEvent, useEffect, useMemo, useState } from 'react'

// const ManageParticipantsPage = () => {
// 	const router = useRouter()

// 	const { ready, authenticated, user, signMessage, sendTransaction, logout } =
// 		usePrivy()

// 	const { wallets, ready: walletsReady } = useWallets()

// 	const [poolDbData, setPoolDbData] = useState<any | undefined>()

// 	const [winnerAddresses, setWinnerAddresses] = useState<string[]>([])
// 	const [filteredWinnerAddresses, setFilteredWinnerAddresses] =
// 		useState<string[]>(winnerAddresses)

// 	const [winnerDetails, setWinnerDetails] = useState<string[][] | null>([[]])
// 	const [winnersInfo, setWinnersInfo] = useState<any>()

// 	const [pageUrl, setPageUrl] = useState('')

// 	const { currentJwt } = useCookie()

// 	const poolId = router?.query?.poolId

// 	const [query, setQuery] = useState('')

// 	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
// 		console.log('Query', e.target.value)
// 		setQuery(e.target.value)
// 		filterParticipantsInfo(e.target.value)
// 		filterCheckedInParticipantsInfo(e.target.value)
// 	}

// 	const queryClient = useQueryClient()

// 	const { data: poolSCInfo } = useQuery({
// 		queryKey: ['fetchAllPoolDataFromSC', poolId?.toString() ?? ' '],
// 		queryFn: fetchAllPoolDataFromSC,
// 		enabled: !!poolId,
// 	})

// 	const { data: poolWinnersDetails } = useQuery({
// 		queryKey: ['fetchWinnersDetailsFromSC', poolId?.toString() ?? ' '],
// 		queryFn: fetchWinnersDetailsFromSC,
// 		enabled: !!poolId,
// 	})

// 	const { data: poolBalance } = useQuery({
// 		queryKey: ['fetchPoolBalanceFromSC', poolId?.toString() ?? ' '],
// 		queryFn: fetchPoolBalanceFromSC,
// 		enabled: !!poolId,
// 	})

// 	const { data: poolDBInfo } = useQuery({
// 		queryKey: ['fetchAllPoolDataFromDB', poolId?.toString() ?? ' '],
// 		queryFn: fetchAllPoolDataFromDB,
// 		enabled: !!poolId,
// 	})

// 	const poolSCStatus = poolSCInfo?.[3]

// 	let poolSCParticipants = poolSCInfo?.[5]

// 	const { data: participantsInfo } = useQuery({
// 		queryKey: [
// 			'fetchUserDisplayInfoFromServer',
// 			poolId?.toString() ?? '0',
// 			poolSCParticipants,
// 		],
// 		queryFn: fetchParticipantsDataFromServer,
// 		enabled: poolSCParticipants?.length > 0 && poolId?.toString() != undefined,
// 	})

// 	const participantsInfoDict = participantsInfo?.reduce(
// 		(acc, participant) => {
// 			acc[participant.address] = participant
// 			return acc
// 		},
// 		{} as { [key: string]: any },
// 	)

// 	const { data: savedPayoutsInfo } = useQuery({
// 		queryKey: ['fetchSavedPayoutsFromServer', poolId?.toString() ?? '0'],
// 		queryFn: fetchSavedPayoutsFromServer,
// 		enabled: poolId?.toString() != undefined,
// 	})

// 	const savedPayoutsParticipantsAddresses =
// 		savedPayoutsInfo?.map((participant) => participant?.address) ?? []

// 	const savedPayoutsPayoutAmounts =
// 		savedPayoutsInfo?.map((participant) => participant?.payout_amount) ?? []

// 	const checkedInParticipantsInfo = participantsInfo
// 		?.filter((participant) => participant?.participationData?.[0]?.status == 2)
// 		.sort(
// 			(a, b) =>
// 				new Date(a?.participationData?.[0]?.check_in_time).getTime() -
// 				new Date(b?.participationData?.[0]?.check_in_time).getTime(),
// 		)

// 	const onQrButtonClicked = () => {
// 		console.log('QR Button Clicked')
// 	}

// 	const setWinnersMutation = useMutation({
// 		mutationFn: handleSetWinners,
// 		onSuccess: () => {
// 			console.log('setWinners Success')

// 			deleteSavedPayoutsMutation.mutate({
// 				params: [
// 					poolId?.toString() ?? '0',
// 					savedPayoutsParticipantsAddresses,
// 					savedPayoutsPayoutAmounts,
// 					currentJwt ?? '',
// 				],
// 			})
// 			queryClient.invalidateQueries({
// 				queryKey: ['fetchAllPoolDataFromSC', poolId?.toString() ?? '0'],
// 			})
// 			toast({
// 				title: 'Transaction Success',
// 				description: 'Set Winners Successfully',
// 			})
// 		},
// 		onError: (e) => {
// 			console.log('setWinnersMutation Error', e.message)
// 		},
// 	})

// 	const deleteSavedPayoutsMutation = useMutation({
// 		mutationFn: handleDeleteSavedPayouts,
// 		onSuccess: () => {
// 			console.log('deleteSavedPayouts Success')
// 			queryClient.invalidateQueries({
// 				queryKey: ['fetchSavedPayoutsFromServer', poolId?.toString() ?? '0'],
// 			})
// 		},
// 		onError: () => {
// 			console.log('setWinnersMutation Error')
// 		},
// 	})
// 	const onPayoutButtonClicked = () => {
// 		toast({
// 			title: 'Requesting Transaction',
// 			description: 'Handling Payouts',
// 		})
// 		setWinnersMutation.mutate({
// 			params: [
// 				poolId?.toString() ?? '0',
// 				savedPayoutsParticipantsAddresses,
// 				savedPayoutsPayoutAmounts,
// 				wallets,
// 			],
// 		})
// 	}

// 	const [filteredParticipantsInfo, setFilteredParticipantsInfo] =
// 		useState(participantsInfo)
// 	const [
// 		filteredCheckedInParticipantsInfo,
// 		setFilteredCheckedInParticipantsInfo,
// 	] = useState(checkedInParticipantsInfo)
// 	const filterParticipantsInfo = (searchQuery: string) => {
// 		const filteredData = participantsInfo?.filter(
// 			(item) =>
// 				item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// 				item.display_name?.toLowerCase().includes(searchQuery.toLowerCase()),
// 		)
// 		setFilteredParticipantsInfo(filteredData)
// 	}
// 	const filterCheckedInParticipantsInfo = (searchQuery: string) => {
// 		const filteredData = checkedInParticipantsInfo?.filter(
// 			(item) =>
// 				item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// 				item.display_name?.toLowerCase().includes(searchQuery.toLowerCase()),
// 		)
// 		setFilteredCheckedInParticipantsInfo(filteredData)
// 	}
// 	const [, setFilteredWinnersInfo] = useState(winnersInfo)
// 	const filterWinnersInfo = (searchQuery: string) => {
// 		const filteredData = winnersInfo?.filter(
// 			(item: any) =>
// 				item.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// 				participantsInfoDict?.[item.address]
// 					?.toLowerCase()
// 					.display_name.toLowerCase()
// 					.includes(searchQuery.toLowerCase()),
// 		)
// 		setFilteredWinnersInfo(filteredData)
// 	}

// 	useEffect(() => {
// 		setPoolDbData(poolDBInfo?.poolDBInfo)

// 		setWinnerAddresses(dictionaryToArray(poolWinnersDetails?.[0]))
// 		setWinnerDetails(dictionaryToNestedArray(poolWinnersDetails?.[1]))
// 		// for loop to get the winner details
// 		let tempWinnersInfo = []
// 		for (let i = 0; i < winnerAddresses.length; i++) {
// 			tempWinnersInfo.push({
// 				address: winnerAddresses?.[i],
// 				details: winnerDetails?.[i],
// 			})
// 		}
// 		setWinnersInfo(tempWinnersInfo)

// 		setPageUrl(window?.location.href)
// 		setFilteredParticipantsInfo(participantsInfo)
// 		setFilteredCheckedInParticipantsInfo(checkedInParticipantsInfo)
// 	}, [
// 		ready,
// 		authenticated,
// 		poolSCInfo,
// 		poolDBInfo,
// 		participantsInfo,
// 		poolWinnersDetails,
// 		walletsReady,
// 		checkedInParticipantsInfo,
// 		winnerAddresses,
// 		winnerDetails,
// 	])

// 	const parentRoute = useMemo(() => {
// 		const paths = router.asPath.split('/')
// 		paths.pop() // Remove the last sub-route
// 		return paths.join('/')
// 	}, [router.asPath])

// 	const poolPercentage =
// 		(BigInt(poolBalance?.[3] ?? 0) * BigInt(100)) /
// 		BigInt(poolBalance?.[0] ?? 100)

// 	return (
// 		<Page>
// 			<Appbar backRoute={`${parentRoute}`} pageTitle='Manage Participants' />

// 			<Section>
// 				<div className='flex flex-col w-full '>
// 					<div className='relative flex flex-col pt-16 w-full min-h-screen space-y-0 pb-20 md:pb-24 justify-start'>
// 						<div className='relative h-10 mb-2'>
// 							<span className='w-4 h-full absolute left-4 flex items-center'>
// 								<SearchIcon />
// 							</span>
// 							<Link
// 								href={`${pageUrl}/payout-scan`}
// 								className='w-6 h-10 absolute right-0 flex items-center'
// 							>
// 								<span className='w-full h-full flex items-center'>
// 									<svg
// 										width='14'
// 										height='14'
// 										viewBox='0 0 14 14'
// 										fill='black'
// 										xmlns='http://www.w3.org/2000/svg'
// 									>
// 										<path
// 											d='M1.75 6.41667H6.41667V1.75H1.75V6.41667ZM2.91667 2.91667H5.25V5.25H2.91667V2.91667ZM1.75 12.25H6.41667V7.58333H1.75V12.25ZM2.91667 8.75H5.25V11.0833H2.91667V8.75ZM7.58333 1.75V6.41667H12.25V1.75H7.58333ZM11.0833 5.25H8.75V2.91667H11.0833V5.25ZM11.0833 11.0833H12.25V12.25H11.0833V11.0833ZM7.58333 7.58333H8.75V8.75H7.58333V7.58333ZM8.75 8.75H9.91667V9.91667H8.75V8.75ZM7.58333 9.91667H8.75V11.0833H7.58333V9.91667ZM8.75 11.0833H9.91667V12.25H8.75V11.0833ZM9.91667 9.91667H11.0833V11.0833H9.91667V9.91667ZM9.91667 7.58333H11.0833V8.75H9.91667V7.58333ZM11.0833 8.75H12.25V9.91667H11.0833V8.75Z'
// 											fill='black'
// 										/>
// 									</svg>
// 								</span>
// 							</Link>

// 							<Input
// 								type='text'
// 								value={query}
// 								onChange={handleChange}
// 								placeholder='Search'
// 								className='rounded-full mb-2 px-10 h-10'
// 							/>
// 						</div>
// 						<Tabs defaultValue='registered' className='w-full'>
// 							<TabsList className='w-full flex justify-start p-0 space-x-0 md:space-x-8 rounded-none z-10'>
// 								<TabsTrigger value='registered'>Registered</TabsTrigger>
// 								<TabsTrigger value='checkedIn'>Checked in</TabsTrigger>
// 								<TabsTrigger value='winners'>Winners</TabsTrigger>
// 								{/* <TabsTrigger value='refunded'>Refunded</TabsTrigger> */}
// 							</TabsList>
// 							<TabsContent value='registered'>
// 								{filteredParticipantsInfo?.map((participant) => (
// 									<ParticipantRow
// 										key={participant?.id}
// 										name={participant?.display_name}
// 										participantStatus={
// 											participant?.participationData?.[0]?.status
// 										}
// 										imageUrl={participant?.avatar_url}
// 										address={participant?.address}
// 										routeUrl={`${pageUrl}/${participant?.address}`}
// 									/>
// 								))}
// 							</TabsContent>
// 							<TabsContent value='checkedIn'>
// 								{filteredCheckedInParticipantsInfo?.map((participant) => (
// 									<ParticipantRow
// 										key={participant?.id}
// 										name={participant?.display_name}
// 										participantStatus={
// 											participant?.participationData?.[0]?.status
// 										}
// 										imageUrl={participant?.avatar_url}
// 										address={participant?.address}
// 										routeUrl={`${pageUrl}/${participant?.address}`}
// 									/>
// 								))}
// 							</TabsContent>
// 							<TabsContent value='winners'>
// 								<div>
// 									<div className='flex flex-col space-y-2 my-4'>
// 										<div className='flex flex-row justify-between'>
// 											<span>
// 												<span className='font-bold'>
// 													${ethers.formatEther(poolBalance?.[3] ?? 0)}
// 												</span>
// 												{` `}
// 												USDC
// 											</span>
// 											<span>
// 												{poolBalance &&
// 													(
// 														(BigInt(poolBalance?.[3]) * BigInt(100)) /
// 														BigInt(poolBalance?.[0])
// 													).toString()}
// 												% Remaining of $
// 												{ethers.formatEther(poolBalance?.[0] ?? 0)} Prize Pool
// 											</span>
// 										</div>
// 										{poolBalance && <Progress value={Number(poolPercentage)} />}
// 									</div>
// 									{winnerDetails?.map((participant, index) => (
// 										<WinnerRow
// 											key={`${participantsInfoDict?.[winnerAddresses[index]]
// 												?.id}_${index}`}
// 											name={
// 												participantsInfoDict?.[winnerAddresses[index]]
// 													?.display_name
// 											}
// 											participantStatus={
// 												participantsInfoDict?.[winnerAddresses[index]]
// 													?.participationData?.[0]?.status
// 											}
// 											imageUrl={
// 												participantsInfoDict?.[winnerAddresses[index]]
// 													?.avatar_url
// 											}
// 											address={winnerAddresses[index]}
// 											routeUrl={`${pageUrl}/${winnerAddresses[index]}`}
// 											prizeAmount={participant?.[0]}
// 											setWinner={true}
// 										/>
// 									))}
// 									{savedPayoutsInfo?.map((participant, index) => (
// 										<WinnerRow
// 											key={participant?.id}
// 											name={
// 												participantsInfoDict?.[participant?.address]
// 													?.display_name
// 											}
// 											participantStatus={
// 												participantsInfoDict?.[participant?.address]
// 													?.participationData?.[0]?.status
// 											}
// 											address={participant?.address}
// 											routeUrl={`${pageUrl}/${participant?.address}`}
// 											prizeAmount={participant?.payout_amount ?? 0}
// 											setWinner={false}
// 										/>
// 									))}
// 									<div className='fixed flex space-x-2 flex-row bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 max-w-screen-md w-full px-6'>
// 										<button
// 											className={`bg-black flex text-center justify-center items-center flex-1 h-12 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline `}
// 											onClick={onPayoutButtonClicked}
// 										>
// 											Payout
// 										</button>
// 									</div>
// 								</div>
// 							</TabsContent>
// 							{/* <TabsContent value='refunded'>Refunded</TabsContent> */}
// 						</Tabs>
// 					</div>
// 				</div>
// 			</Section>
// 		</Page>
// 	)
// }

// export default ManageParticipantsPage
