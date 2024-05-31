import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useCookie } from '@/hooks/cookie'
import {
	handleCreatePool,
	handleCreatePoolServer,
	uploadProfileImage,
} from '@/lib/api/clientAPI'
import { convertToBase64 } from '@/lib/utils'
import { useState } from 'react'
import frogImage from '@/public/images/frog.png'
import camera from '@/public/images/camera.png'
import styles from './styles/user-profile.module.css'
import { testnetTokenAddress, tokenAddress } from '@/constants/constant'
import { useMutation } from '@tanstack/react-query'
import { useWallets } from '@privy-io/react-auth'

export default function CreatePoolPage() {
	// save the current form values in the state:
	const [bannerImage, setBannerImage] = useState('')
	const [name, setName] = useState('')
	const [mainHost, setMainHost] = useState('')
	const [coHosts, setCoHosts] = useState('')
	const [date, setDate] = useState('')
	const [endDate, setEndDate] = useState('')

	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [softCap, setSoftCap] = useState('')
	const [termsUrl, setTermsUrl] = useState('')

	const [fileBlob, setFileBlob] = useState<any>(null)
	const [selectedFile, setSelectedFile] = useState<any>(null)
	const [selectedFileBase64, setSelectedFileBase64] = useState<any>(null)
	const { currentJwt } = useCookie()
	const [isImageReady, setIsImageReady] = useState<boolean>(true)
	const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(
		`${frogImage.src}`,
	)

	const { wallets } = useWallets()

	const handleImageChange = async (e: any) => {
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

		const base64 = await convertToBase64(file)
		setSelectedFileBase64(base64)
	}

	const triggerFileInput = () => {
		document.getElementById('fileInput')?.click()
	}

	const createPoolServerMutation = useMutation({
		mutationFn: handleCreatePoolServer,
		onSuccess: () => {
			console.log('createPoolServerMutation Success')
		},
		onError: () => {
			console.log('registerMutation Error')
		},
	})

	// selectedFile.name as string,
	// selectedFile.type as string,
	// selectedFileBase64,
	// timeStart,
	// timeEnd,
	// poolName,
	// price,
	// penalty,
	// tokenAddress,
	// coHosts,
	// currentJwt ?? ' ',

	const createPoolMutation = useMutation({
		mutationFn: handleCreatePool,
		onSuccess: () => {
			console.log('createPoolMutation Success')
			// 	fileName,
			// fileType,
			// fileBase64,
			// timeStart,
			// timeEnd,
			// poolName,
			// price,
			// penalty,
			// tokenAddr,
			// jwt,
			createPoolServerMutation.mutate({
				params: [
					selectedFile.name,
					selectedFile.type,
					selectedFileBase64,
					date,
					endDate,
					name,
					description,
					price,
					softCap,
					'0',
					tokenAddress,
					coHosts.split(','),
					termsUrl,
					currentJwt ?? ' ',
				],
			})
		},
		onError: () => {
			console.log('createPoolMutation Error')
		},
	})
	const onCreatePoolButtonClicked = () => {
		createPoolMutation.mutate({
			params: [date, endDate, name, price, '0', tokenAddress, wallets],
		})
	}

	// const handleFormSubmission = async (e: any) => {
	// 	e.preventDefault()
	// 	e.stopPropagation()
	// 	// await new Promise((resolve) => setTimeout(resolve, 1000))
	// 	console.log('creating pool')
	// 	toast({
	// 		title: 'Creating Pool',
	// 		description: 'Please wait...',
	// 	})

	// 	const formValues = {
	// 		name,
	// 		mainHost,
	// 		coHosts,
	// 		date,
	// 		endDate,
	// 		description,
	// 		price,
	// 		tokenAddress: testnetTokenAddress,
	// 		softCap,
	// 		termsUrl,
	// 	}

	// 	await handleCreatePoolServer(
	// 		selectedFile.name,
	// 		selectedFile.type,
	// 		formValues,
	// 		currentJwt!,
	// 	)
	// 	console.log(formValues)
	// }

	return (
		<div className='mt-8 px-6'>
			<div className='text-center text-base font-medium leading-normal text-[#090909]'>
				Create Pool
			</div>
			{/* <form
				className='flex w-full flex-col gap-6 py-6'
				onSubmit={async (e) => {
					await handleFormSubmission(e)
				}}
			> */}
			<section className='flex flex-1 flex-col gap-6'>
				{/* Banner Image */}
				<div>
					<div>
						<input
							type='file'
							accept='image/*'
							id='fileInput'
							onChange={handleImageChange}
							className='hidden'
						/>
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
					</div>
				</div>

				{/* Name */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>Name</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>Name</p>
					<Input value={name} onChange={(e) => setName(e.target.value)} />
				</div>

				{/* Main Host */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Main Host
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Host Address
					</p>
					<Input
						value={mainHost}
						onChange={(e) => setMainHost(e.target.value)}
					/>
				</div>

				{/* Co-Hosts  */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Co-hosts
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Host address in string, separated by commas
					</p>
					<Input value={coHosts} onChange={(e) => setCoHosts(e.target.value)} />
				</div>

				{/* Starting Date and Time of Event */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Date Start
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Start Date and Time
					</p>
					<Input value={date} onChange={(e) => setDate(e.target.value)} />
				</div>
				{/* Ending Date and Time of Event */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Date End
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						End Date and Time
					</p>
					<Input value={endDate} onChange={(e) => setEndDate(e.target.value)} />
				</div>

				{/* Description */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Description
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Update a banner photo; ideal aspect ratio is 2:1.
					</p>
					<Input
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Price */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>Price</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Price
					</p>
					<Input value={price} onChange={(e) => setPrice(e.target.value)} />
				</div>

				{/* Soft Cap */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Soft Cap
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Update a banner photo; ideal aspect ratio is 2:1.
					</p>
					<Input value={softCap} onChange={(e) => setSoftCap(e.target.value)} />
				</div>

				{/* Terms URL */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Terms URL
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						Update a banner photo; ideal aspect ratio is 2:1.
					</p>
					<Input
						value={termsUrl}
						onChange={(e) => setTermsUrl(e.target.value)}
					/>
				</div>
			</section>
			<Button
				className='bottom-6 left-1/2 w-[345px] rounded-[32px] bg-gradient-to-b from-[#36A0F7] to-[#1364DA] py-[11px] shadow-[inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]'
				onClick={onCreatePoolButtonClicked}
			>
				Create Pool
			</Button>
			{/* </form> */}
		</div>
	)
}
