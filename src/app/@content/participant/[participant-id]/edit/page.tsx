export default function EditParticipantPage() {
	return (
		<div>
			<h1>Edit User Profile</h1>
		</div>
	)
}

// import Appbar from '@/components/appbar'
// import Section from '@/components/section'
// import {
// 	fetchUserDisplayForAddress,
// 	handleUpdateUserDisplayData,
// 	uploadProfileImage,
// } from '@/lib/api/clientAPI'
// import camera from '@/public/images/camera.png'
// import frogImage from '@/public/images/frog.png'
// import { usePrivy, useWallets } from '@privy-io/react-auth'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import Image from 'next/image'
// import { useRouter } from 'next/router'
// import { ChangeEvent, useEffect, useState } from 'react'
// import styles from './styles/user-profile.module.css'

// import { useToast } from '@/components/ui/use-toast'
// import { useCookie } from '@/hooks/cookie'
// import { convertToBase64, formatAddress } from '@/lib/utils'
// import _ from 'lodash'

// const EditUserProfile = () => {
// 	const router = useRouter()
// 	const { ready, authenticated, logout } = usePrivy()

// 	const { wallets } = useWallets()
// 	const queryClient = useQueryClient()

// 	const [fileBlob, setFileBlob] = useState<any>(null)
// 	const [selectedFile, setSelectedFile] = useState<any>(null)
// 	const [selectedFileBase64, setSelectedFileBase64] = useState<any>(null)

// 	const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
// 		`${frogImage.src}`,
// 	)
// 	const [isImageReady, setIsImageReady] = useState<boolean>(true)

// 	const { toast } = useToast()

// 	const [displayName, setDisplayName] = useState<string>('')
// 	const [company, setCompany] = useState<string>('')
// 	const [bio, setBio] = useState<string>('')
// 	const { currentJwt } = useCookie()

// 	const handleDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
// 		setDisplayName(e.target.value)
// 	}
// 	const handleCompanyChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
// 		setCompany(e.target.value)
// 	}
// 	const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
// 		setBio(e.target.value)
// 	}

// 	const handleImageChange = async (e: any) => {
// 		setIsImageReady(false)
// 		if (e.target.files?.length === 0) {
// 			// User cancelled selection
// 			setIsImageReady(true)
// 			console.log('User cancelled image selection')
// 		}
// 		const file = e.target.files?.[0]
// 		if (file) {
// 			setProfileImageUrl(URL.createObjectURL(file))
// 		}
// 		setSelectedFile(file)

// 		if (file) {
// 			const reader = new FileReader()
// 			reader.onload = () => {
// 				setFileBlob(reader.result)
// 				console.log('File Loaded')
// 				console.log('reader.result', reader.result)
// 				setIsImageReady(true)
// 			}
// 			reader.onerror = (e) => {
// 				console.error('Error reading file:', e)
// 				setIsImageReady(true)
// 			}
// 			reader.onabort = () => {
// 				console.error('Aborted')
// 				setIsImageReady(true)
// 			}
// 			reader.readAsArrayBuffer(file)
// 		}

// 		const base64 = await convertToBase64(file)
// 		setSelectedFileBase64(base64)
// 	}

// 	const updateUserDisplayDataMutation = useMutation({
// 		mutationFn: handleUpdateUserDisplayData,
// 		onSuccess: () => {
// 			toast({
// 				title: 'Profile Updated',
// 				description: 'Profile has been updated successfully',
// 			})
// 			queryClient.invalidateQueries({
// 				queryKey: ['loadProfileImage', wallets?.[0]?.address],
// 			})
// 		},
// 		onError: (error) => {
// 			toast({
// 				title: 'Failed to update profile',
// 				description: `${error.message}. Try again later`,
// 			})
// 		},
// 	})

// 	const handleSaveButtonClicked = async (e: any) => {
// 		toast({
// 			title: 'Saving Details',
// 			description: 'Please wait',
// 		})
// 		if (fileBlob != null) {
// 			await uploadProfileImage(
// 				fileBlob!,
// 				selectedFile,
// 				selectedFileBase64,
// 				currentJwt!,
// 			)
// 		}
// 		console.log('wallet address', wallets[0]?.address)
// 		updateUserDisplayDataMutation.mutate({
// 			params: [displayName, company, bio, currentJwt!],
// 		})
// 	}

// 	const { data: profileData } = useQuery({
// 		queryKey: ['loadProfileImage', wallets?.[0]?.address],
// 		queryFn: fetchUserDisplayForAddress,
// 		enabled: wallets.length > 0,
// 	})

// 	const triggerFileInput = () => {
// 		document.getElementById('fileInput')?.click()
// 	}

// 	const handleSignOut = async () => {
// 		console.log('handleSignOut')
// 		wallets?.[0]?.disconnect()

// 		toast({
// 			title: 'Logging Out',
// 			description: 'Please wait...',
// 		})
// 		await logout()
// 	}

// 	useEffect(() => {
// 		if (ready && !authenticated) {
// 			router.push('/')
// 		}

// 		if (profileData?.profileImageUrl) {
// 			setProfileImageUrl(profileData?.profileImageUrl)
// 		}
// 		setBio(profileData?.userDisplayData.bio ?? '')
// 		setDisplayName(profileData?.userDisplayData.display_name ?? '')
// 		setCompany(profileData?.userDisplayData.company ?? '')
// 		console.log('displayName', profileData)
// 	}, [profileData, ready, authenticated, router, wallets])

// 	return (
// 		<>
// 			<Appbar backRoute='/user-profile' pageTitle='Edit User Profile' />
// 			<Section>
// 				<div
// 					className={`flex justify-center w-full mt-20 min-h-screen font-body`}
// 				>
// 					<div className='flex flex-col w-96 pb-8'>
// 						<div>
// 							<input
// 								title='Change Profile Image'
// 								type='file'
// 								accept='image/*'
// 								id='fileInput'
// 								onChange={handleImageChange}
// 								className='hidden'
// 							/>
// 						</div>

// 						<div className='flex w-full justify-center flex-col items-center'>
// 							<button
// 								title='Change Profile Image'
// 								type='button'
// 								onClick={triggerFileInput}
// 								className='relative rounded-full m-8 w-40 aspect-square '
// 							>
// 								{profileImageUrl && (
// 									<Image
// 										className='rounded-full w-40 aspect-square center object-cover z-0'
// 										src={profileImageUrl}
// 										alt='profile image'
// 										width={160}
// 										height={160}
// 									/>
// 								)}
// 								<div
// 									className={`w-full h-full rounded-full absolute top-0 left-0 ${styles.overlay} z-10 flex items-center justify-center`}
// 								>
// 									<Image
// 										src={camera.src}
// 										className='object-center object-contain'
// 										alt='camera icon'
// 										fill
// 									/>
// 								</div>
// 							</button>
// 							<h3 className='font-medium'>
// 								{!_.isEmpty(wallets?.[0]?.address) &&
// 									formatAddress(wallets?.[0]?.address)}
// 							</h3>
// 						</div>

// 						<div className={`border-t-4 ${styles.divider}`}></div>
// 						<div className='flex flex-row'>
// 							<div className='h-10 flex flex-row items-center flex-1 font-semibold'>
// 								Display name
// 							</div>
// 							<input
// 								type='text'
// 								value={displayName}
// 								onChange={handleDisplayNameChange}
// 								placeholder='Display Name'
// 								className='rounded-lg my-2 px-4 flex flex-1 bg-white text-black'
// 							/>
// 						</div>
// 						<div className={`border-t-4 ${styles.divider}`}></div>
// 						<div className='flex flex-col'>
// 							<div className='h-10  font-semibold'>
// 								Bio
// 								<span className='text-xs font-medium'>(optional)</span>
// 							</div>
// 							<textarea
// 								value={bio}
// 								onChange={handleBioChange}
// 								placeholder='Write something enticing about yourself'
// 								className='rounded-lg outline-1 outline outline-gray-100 h-24 p-2 bg-white text-black'
// 							></textarea>
// 						</div>

// 						<div className={`border-t-4 ${styles.divider}`}></div>
// 						<div className='h-10  font-semibold'>
// 							Company
// 							<span className='text-xs font-medium'>(optional)</span>
// 						</div>

// 						<textarea
// 							value={company}
// 							onChange={handleCompanyChange}
// 							placeholder='Write something enticing about yourself'
// 							className='rounded-lg outline-1 outline outline-gray-100 h-24 p-2 bg-white text-black'
// 						></textarea>
// 						<div className='flex justify-center mt-8'>
// 							{isImageReady && (
// 								<button
// 									title='Save Profile Details'
// 									type='button'
// 									className='bg-black rounded-full text-white py-4 px-8 w-full mt-4'
// 									onClick={handleSaveButtonClicked}
// 								>
// 									Save
// 								</button>
// 							)}
// 						</div>
// 						<div className='mt-8 flex justify-center'>
// 							<button title='Sign Out' type='button' onClick={handleSignOut}>
// 								Sign Out
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</Section>
// 		</>
// 	)
// }

// export default EditUserProfile
