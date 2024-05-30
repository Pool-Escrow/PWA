import Page from '@/components/page'
import Section from '@/components/section'
import Image from 'next/image'
import frogImage from '@/public/images/frog.png'
import { useRouter } from 'next/router'
import {
	UnsignedTransactionRequest,
	usePrivy,
	useWallets,
} from '@privy-io/react-auth'

import React, { useState, useEffect, ChangeEvent } from 'react'

import { ethers } from 'ethers'
import Appbar from '@/components/appbar'

import { FundWalletConfig } from '@privy-io/react-auth'
import { provider } from '@/constants/constant'
import { Inter } from 'next/font/google'
import styles from './styles/user-profile.module.css'
import {
	fetchUserDisplayForAddress,
	updateUserDisplayData,
	uploadProfileImage,
} from '@/lib/api/clientAPI'
import camera from '@/public/images/camera.png'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import * as _ from 'lodash'
import { useToast } from '@/components/ui/use-toast'
import { formatAddress } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

const EditUserProfile = () => {
	const router = useRouter()
	const {
		ready,
		authenticated,
		user,
		signMessage,
		sendTransaction,
		getAccessToken,
		logout,
	} = usePrivy()

	const { wallets } = useWallets()

	const [fileBlob, setFileBlob] = useState<any>(null)
	const [selectedFile, setSelectedFile] = useState<any>(null)
	const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
		`${frogImage.src}`,
	)
	const [isImageReady, setIsImageReady] = useState<boolean>(true)

	const { toast } = useToast()

	const [displayName, setDisplayName] = useState<string>('')
	const [company, setCompany] = useState<string>('')
	const [bio, setBio] = useState<string>('')
	const [currentJwt, setCurrentJwt] = useState<string | null>()

	const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		setDisplayName(e.target.value)
	}
	const handleCompanyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setCompany(e.target.value)
	}
	const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setBio(e.target.value)
	}

	const handleImageChange = (e: any) => {
		setIsImageReady(false)
		if (e.target.files?.length === 0) {
			// User cancelled selection
			setIsImageReady(true)
			console.log('User cancelled image selection')
		}
		const file = e.target.files?.[0]
		if (file) {
			setProfileImageUrl(URL.createObjectURL(file))
		}
		setSelectedFile(file)
		if (file) {
			const reader = new FileReader()
			reader.onload = () => {
				setFileBlob(reader.result)
				console.log('File Loaded')
				console.log('reader.result', reader.result)
				setIsImageReady(true)
			}
			reader.onerror = (e) => {
				console.error('Error reading file:', e)
				setIsImageReady(true)
			}
			reader.onabort = () => {
				console.error('Aborted')
				setIsImageReady(true)
			}
			reader.readAsArrayBuffer(file)
		}
	}

	const handleSaveButtonClicked = async (e: any) => {
		if (fileBlob != null) {
			await uploadProfileImage(
				fileBlob!,
				selectedFile,
				wallets[0].address,
				currentJwt!,
			)
		}
		const { userData, userError } = await updateUserDisplayData(
			displayName,
			company,
			bio,
			currentJwt!,
			wallets[0].address,
		)

		if (userError) {
			toast({
				title: 'Error',
				description: userError.message,
			})
		} else {
			toast({
				title: 'Saving Details',
				description: 'You have saved the data successfully',
			})
		}
	}

	const address = wallets?.[0]?.address ?? '0x'
	const { data: profileData } = useQuery({
		queryKey: ['loadProfileImage', wallets?.[0]?.address],
		queryFn: fetchUserDisplayForAddress,
		enabled: wallets.length > 0,
	})

	const triggerFileInput = () => {
		document.getElementById('fileInput')?.click()
	}

	const handleSignOut = async () => {
		console.log('handleSignOut')
		wallets?.[0]?.disconnect()

		toast({
			title: 'Logging Out',
			description: 'Please wait...',
		})
		await logout()
	}

	const retrieveAccessToken = async () => {
		const token = await getAccessToken()
		setCurrentJwt(token)
	}

	useEffect(() => {
		if (ready && !authenticated) {
			// Replace this code with however you'd like to handle an unauthenticated user
			// As an example, you might redirect them to a sign-in page
			router.push('/')
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
		retrieveAccessToken()
		setBio(profileData?.userDisplayData.bio ?? '')
		setDisplayName(profileData?.userDisplayData.display_name ?? '')
		setCompany(profileData?.userDisplayData.company ?? '')
		console.log('displayName', profileData)
	}, [profileData, ready, authenticated, router])

	return (
		<Page>
			<Appbar backRoute='/user-profile' pageTitle='Edit User Profile' />
			<Section>
				<div
					className={`flex justify-center w-full mt-20 min-h-screen ${inter.className}`}
				>
					<div className='flex flex-col w-96 pb-8'>
						<div>
							<input
								type='file'
								accept='image/*'
								id='fileInput'
								onChange={handleImageChange}
								className='hidden'
							/>
						</div>

						<div className='flex w-full justify-center flex-col items-center'>
							<button
								onClick={triggerFileInput}
								className='relative rounded-full m-8 w-40 aspect-square '
							>
								<img
									className='rounded-full w-40 aspect-square center object-cover z-0'
									src={profileImageUrl}
								/>
								<div
									className={`w-full h-full rounded-full absolute top-0 left-0 ${styles.overlay} z-10 flex items-center justify-center`}
								>
									<img
										src={camera.src}
										className='object-center   object-contain'
									/>
								</div>
							</button>
							<h3 className='font-medium'>
								{!_.isEmpty(wallets?.[0]?.address) &&
									formatAddress(wallets?.[0]?.address)}
							</h3>
						</div>

						<div className={`border-t-4 ${styles.divider}`}></div>
						<div className='flex flex-row'>
							<div className='h-10 flex flex-row items-center flex-1 font-semibold'>
								Display name
							</div>
							<input
								type='text'
								value={displayName}
								onChange={handleDisplayNameChange}
								placeholder='Display Name'
								className='rounded-lg my-2 px-4 flex flex-1 bg-white text-black'
							/>
						</div>
						<div className={`border-t-4 ${styles.divider}`}></div>
						<div className='flex flex-col'>
							<div className='h-10  font-semibold'>
								Bio
								<span className='text-xs font-medium'>(optional)</span>
							</div>
							<textarea
								value={bio}
								onChange={handleBioChange}
								placeholder='Write something enticing about yourself'
								className='rounded-lg outline-1 outline outline-gray-100 h-24 p-2 bg-white text-black'
							></textarea>
						</div>

						<div className={`border-t-4 ${styles.divider}`}></div>
						<div className='h-10  font-semibold'>
							Company
							<span className='text-xs font-medium'>(optional)</span>
						</div>

						<textarea
							value={company}
							onChange={handleCompanyChange}
							placeholder='Write something enticing about yourself'
							className='rounded-lg outline-1 outline outline-gray-100 h-24 p-2 bg-white text-black'
						></textarea>
						<div className='flex justify-center mt-8'>
							{isImageReady && (
								<button
									className='bg-black rounded-full text-white py-4 px-8 w-full mt-4'
									onClick={handleSaveButtonClicked}
								>
									Save
								</button>
							)}
						</div>
						<div className='mt-8 flex justify-center'>
							<button onClick={handleSignOut}>Sign Out</button>
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}

export default EditUserProfile
