import Page from '@/components/page'
import Section from '@/components/section'
import frogImage from '@/public/images/frog.png'
import { useRouter } from 'next/router'
import {
	UnsignedTransactionRequest,
	usePrivy,
	useWallets,
} from '@privy-io/react-auth'

import React, { useState, useEffect, ChangeEvent, useMemo, useRef } from 'react'

import Appbar, { RightMenu } from '@/components/appbar'

import { Inter } from 'next/font/google'

import {
	fetchAdminUsersFromServer,
	fetchUserDisplayForAddress,
	handleSavePayout,
	handleSetWinner,
} from '@/lib/api/clientAPI'
import { removeTokenCookie, useCookie } from '@/hooks/cookie'
import { JwtPayload, decode } from 'jsonwebtoken'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as _ from 'lodash'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import styles from './styles/admin.module.css'
import { ethers } from 'ethers'

const inter = Inter({ subsets: ['latin'] })

const UserProfile = () => {
	const router = useRouter()
	const { ready, authenticated, user, signMessage, sendTransaction, logout } =
		usePrivy()

	const { wallets, ready: walletsReady } = useWallets()

	const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
		`${frogImage.src}`,
	)

	const { currentJwt } = useCookie()
	const { toast } = useToast()

	const [displayName, setDisplayName] = useState<string>('')

	const address = wallets?.[0]?.address ?? '0x'
	const { data: profileData } = useQuery({
		queryKey: ['loadProfileImage', wallets?.[0]?.address],
		queryFn: fetchUserDisplayForAddress,
		enabled: wallets.length > 0,
	})
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [inputValue, setInputValue] = useState<string>('0')

	const parentRoute = useMemo(() => {
		const paths = router.asPath.split('/')
		paths.pop() // Remove the last sub-route
		return paths.join('/')
	}, [router.asPath])

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value)
	}

	const poolId = router?.query?.poolId! ?? 0
	const participantAddress = router?.query?.address! ?? '0x'

	const queryClient = useQueryClient()

	const setWinnerMutation = useMutation({
		mutationFn: handleSetWinner,
		onSuccess: () => {
			console.log('setWinner Success')
			queryClient.invalidateQueries({
				queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
			})
		},
		onError: () => {
			console.log('setWinner Error')
		},
	})

	const savePayoutMutation = useMutation({
		mutationFn: handleSavePayout,
		onSuccess: () => {
			console.log('savePayout Success')
			toast({
				title: 'Success',
				description: 'Saved Payout',
			})
			setInputValue('0')
			queryClient.invalidateQueries({
				queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
			})
		},
		onError: () => {
			console.log('setWinner Error')
		},
	})

	const onPayoutButtonClicked = (e: any) => {
		toast({
			title: 'Requesting Transaction',
			description: 'Set Winner',
		})

		setWinnerMutation.mutate({
			params: [
				poolId.toString(),
				participantAddress.toString(),
				inputValue,
				wallets,
			],
		})
	}

	const onSavePayoutButtonClicked = (e: any) => {
		toast({
			title: 'Saving Payout',
			description: 'Saving payout',
		})

		savePayoutMutation.mutate({
			params: [
				poolId.toString(),
				ethers.parseEther(inputValue).toString(),
				participantAddress.toString(),
				currentJwt!,
			],
		})
	}

	const { isSuccess: fetchAdminUsersSuccess, data: adminUsers } = useQuery({
		queryKey: ['fetchAdminUsersFromServer'],
		queryFn: fetchAdminUsersFromServer,
	})

	useEffect(() => {
		if (ready && !authenticated) {
			// Replace this code with however you'd like to handle an unauthenticated user
			// As an example, you might redirect them to a sign-in page
			router.push('/login')
		}
		if (fetchAdminUsersSuccess && ready && authenticated && walletsReady) {
			const isAddressInList = adminUsers?.some(
				(user) =>
					user.address?.toLowerCase() === wallets?.[0]?.address?.toLowerCase(),
			)
			console.log('adminUsersData', adminUsers)
			console.log('walletAddress', wallets?.[0]?.address?.toLowerCase())

			if (!isAddressInList) {
				router.push('/')
			}
		}

		if (wallets.length > 0) {
			console.log(`Wallet Length: ${wallets.length}`)
			// console.log(`Wallet Address: ${wallets[0].address}`)
		}
		for (var i = 0; i < wallets.length; i++) {
			console.log(`Wallet ${i} Address: ${wallets[i].address}`)
		}

		if (profileData?.profileImageUrl) {
			setProfileImageUrl(profileData?.profileImageUrl)
		}
		setDisplayName(profileData?.userDisplayData.display_name ?? '')
		console.log('displayName', profileData)
		if (inputRef?.current) {
			inputRef.current.focus()
		}
	}, [
		profileData,
		ready,
		authenticated,
		router,
		inputRef,
		inputValue,
		adminUsers,
		wallets,
		fetchAdminUsersSuccess,
		walletsReady,
	])

	return (
		<Page>
			<Appbar
				backRoute={parentRoute}
				pageTitle='User Profile'
				rightMenu={RightMenu.RefundMenu}
			/>
			<Section>
				<div
					className={`flex justify-center w-full mt-20 min-h-screen ${inter.className}`}
				>
					<div className='flex flex-col w-96 pb-8'>
						<div className='flex w-full justify-center'>
							<img
								className='rounded-full w-24 aspect-square center object-cover z-0'
								src={profileImageUrl}
							/>
						</div>

						<div className='flex flex-row'>
							<h3 className='h-10 flex flex-row items-center justify-center flex-1 font-semibold'>
								{displayName}
							</h3>
						</div>
						<div className='flex flex-row justify-center'>
							<p>Checked in</p>
						</div>
						<div className='flex flex-row justify-center h-16 mt-2 '>
							<div className='flex relative justify-center '>
								<Input
									className='border-none text-center text-6xl font-bold h-16 w-auto'
									placeholder=''
									autoFocus={true}
									value={inputValue}
									type='number'
									onChange={handleInputChange}
									ref={inputRef}
									inputMode='numeric'
								/>
								{/* <span className='absolute left-0 flex-row text-sm h-16 justify-center py-2'>
									$
								</span> */}
							</div>
						</div>
						<div className='flex flex-col w-full items-center justify-center mt-8 space-y-2'>
							<button
								className='rounded-full bg-black text-white h-10 w-48 font-medium'
								onClick={onSavePayoutButtonClicked}
							>
								Save
							</button>
							<button
								className='rounded-full bg-black text-white h-10 w-48 font-medium'
								onClick={onPayoutButtonClicked}
							>
								Payout
							</button>
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}

export default UserProfile
