import Appbar from '@/components/appbar'
import ClaimablePoolRow from '@/components/claimablePoolRow'
import Divider from '@/components/divider'
import Page from '@/components/page'
import Section from '@/components/section'
import { useToast } from '@/components/ui/use-toast'
import {
	fetchClaimablePoolsFromSC,
	fetchUserDisplayForAddress,
	handleClaimWinnings,
} from '@/lib/api/clientAPI'
import {
	formatAddress,
	getAllIndicesMatching,
	getValuesFromIndices,
} from '@/lib/utils'
import frogImage from '@/public/images/frog.png'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import _ from 'lodash'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

const UserProfile = () => {
	const router = useRouter()
	const { ready, authenticated } = usePrivy()

	const { wallets } = useWallets()

	const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
		`${frogImage.src}`,
	)

	const queryClient = useQueryClient()
	const { toast } = useToast()

	const { data: profileData } = useQuery({
		queryKey: ['loadProfileImage', wallets?.[0]?.address],
		queryFn: fetchUserDisplayForAddress,
		enabled: wallets.length > 0,
	})

	const { data: claimablePoolsInfo } = useQuery({
		queryKey: ['fetchClaimablePoolsFromSC', wallets?.[0]?.address],
		queryFn: fetchClaimablePoolsFromSC,
		enabled: !!wallets?.[0]?.address,
	})
	const poolIds = claimablePoolsInfo?.[0]
	const poolsClaimed = claimablePoolsInfo?.[1]

	const poolIdIndices = getAllIndicesMatching(poolsClaimed, false)

	const poolIdsToClaimFrom = getValuesFromIndices(poolIds, poolIdIndices)

	const claimAllMutation = useMutation({
		mutationFn: handleClaimWinnings,
		onSuccess: () => {
			toast({
				title: 'Transaction Suceess',
				description: 'You have claimed your winnings.',
			})
			console.log('claimWinningsMutation Success')
			queryClient.invalidateQueries({
				queryKey: ['fetchClaimablePoolsFromSC', wallets?.[0]?.address],
			})
		},
		onError: () => {
			console.log('claimMutation Error')
		},
	})

	const onClaimAllButtonClicked = () => {
		toast({
			title: 'Requesting Transaction/s',
			description: 'Approve claim winnings',
		})
		claimAllMutation.mutate({
			params: [poolIdsToClaimFrom, wallets],
		})
	}

	useEffect(() => {
		if (ready && !authenticated) {
			router.push('/login')
		}

		for (var i = 0; i < wallets.length; i++) {
			console.log(`Wallet ${i} Address: ${wallets[i].address}`)
		}

		if (profileData?.profileImageUrl) {
			setProfileImageUrl(profileData?.profileImageUrl)
		}

		console.log('displayName', profileData)
	}, [profileData, ready, authenticated, router, wallets])

	return (
		<Page>
			<Appbar backRoute='/' pageTitle='User Profile' />
			<Section>
				<div
					className={`flex justify-center w-full mt-20 min-h-screen ${inter.className}`}
				>
					<div className='flex flex-col w-full pb-8 space-y-4'>
						<div className='flex w-full justify-center flex-col items-center space-y-4'>
							{profileImageUrl && (
								<Image
									className='rounded-full w-40 aspect-square center object-cover z-0'
									src={profileImageUrl}
									alt='avatar'
									width={160}
									height={160}
								/>
							)}
							{!_.isEmpty(wallets?.[0]?.address) && (
								<h3 className='font-medium'>
									{formatAddress(wallets?.[0]?.address)}
								</h3>
							)}
						</div>
						<div className='flex justify-center'>
							<Link
								className='bg-black rounded-full text-white  px-8 w-full py-2 text-center barForeground'
								href={'/edit-user-profile'}
							>
								Edit Profile
							</Link>
						</div>
						<div
							className={`flex flex-col rounded-3xl cardBackground w-full p-6 md:p-10 md:space-y-10`}
						>
							<h2 className='font-medium'>Claimable</h2>
							<Divider />
							{poolIdsToClaimFrom?.map((poolId: string) => {
								return (
									<ClaimablePoolRow
										poolId={poolId.toString()}
										key={poolId.toString()}
									/>
								)
							})}
						</div>
					</div>
				</div>
				<div className='fixed bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 max-w-screen-md w-full px-6'>
					<button
						className={`barForeground w-full h-12 md:h-16 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline md:text-2xl`}
						onClick={onClaimAllButtonClicked}
					>
						Claim All
					</button>
				</div>
			</Section>
		</Page>
	)
}

export default UserProfile
