import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { tokenAddress } from '@/constants/constant'
import { useCookie } from '@/hooks/cookie'
import { handleCreatePool, handleCreatePoolServer } from '@/lib/api/clientAPI'
import { convertToBase64 } from '@/lib/utils'
import camera from '@/public/images/camera.png'
import frogImage from '@/public/images/frog.png'
import { useWallets } from '@privy-io/react-auth'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styles from './styles/user-profile.module.css'

export default function CreatePoolPage() {
	// save the current form values in the state:
	const [bannerImage, setBannerImage] = useState('')
	const [name, setName] = useState('')
	const [mainHost, setMainHost] = useState('')
	const [coHosts, setCoHosts] = useState('')
	const [startDate, setStartDate] = useState<string>(
		new Date().toLocaleTimeString(),
	)
	const [endDate, setEndDate] = useState<string>(
		new Date().toLocaleTimeString(),
	)
	const [startTime, setStartTime] = useState(new Date().toLocaleTimeString())
	const [endTime, setEndTime] = useState(new Date().toLocaleTimeString())

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
	const router = useRouter()

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

	const getUnixTimestamp = (selectedDate: string, selectedTime: string) => {
		console.log(`selectedDate: ${selectedDate}`)
		console.log(`selectedTime: ${selectedTime}`)
		if (!selectedDate || !selectedTime) {
			return (Date.now() / 1000).toString()
		}
		const date = new Date(selectedDate)

		let unixTimestamp = Math.floor(date.getTime() / 1000)

		// Set the hours and minutes of the date object to match the time
		const [hours, minutes] = selectedTime.split(':').map(Number)

		// Convert hours and minutes to seconds
		const secondsFromTime = hours * 3600 + minutes * 60

		console.log(`UNIX getTime: ${unixTimestamp + secondsFromTime}`)
		unixTimestamp += secondsFromTime
		return unixTimestamp.toString()
	}

	const startTimestamp = getUnixTimestamp(startDate!, startTime)
	const endTimestamp = getUnixTimestamp(endDate!, endTime)

	const createPoolServerMutation = useMutation({
		mutationFn: handleCreatePoolServer,
		onSuccess: () => {
			console.log('createPoolServerMutation Success')
			router.push('/admin')
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
					selectedFile?.name,
					selectedFile?.type,
					selectedFileBase64,
					startTimestamp,
					endTimestamp,
					name,
					description,
					price,
					softCap,
					'0',
					tokenAddress,
					mainHost,
					coHosts.split(','),
					termsUrl,
					currentJwt ?? ' ',
				],
			})
		},
		onError: (error) => {
			console.log('createPoolMutation Error')
			console.error(error)
		},
	})
	const onCreatePoolButtonClicked = () => {
		toast({ title: 'Creating Pool', description: 'Please wait...' })
		createPoolMutation.mutate({
			params: [
				startTimestamp,
				endTimestamp,
				name,
				price,
				'0',
				tokenAddress,
				wallets,
			],
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

	useEffect(() => {}, [])

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
							title='Upload Image'
							type='file'
							accept='image/*'
							id='fileInput'
							onChange={handleImageChange}
							className='hidden'
						/>
						<button
							title='Upload Image'
							type='button'
							onClick={triggerFileInput}
							className='relative rounded-full m-8 w-40 aspect-square '
						>
							{profileImageUrl && (
								<Image
									alt='Profile Image'
									className='rounded-full w-40 aspect-square center object-cover z-0'
									src={profileImageUrl}
								/>
							)}
							<div
								className={`w-full h-full rounded-full absolute top-0 left-0 ${styles.overlay} z-10 flex items-center justify-center`}
							>
								<Image
									alt='Camera Icon'
									src={camera.src}
									className='object-center object-contain'
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
					<Input
						type='date'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className='mt-4 w-[280px]'
					/>
					<Input
						type='time'
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						className='mt-4 w-[280px]'
					/>
				</div>
				{/* Ending Date and Time of Event */}
				<div>
					<Label className='text-base font-medium text-[#090909]'>
						Date End
					</Label>
					<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
						End Date and Time
					</p>
					{/* <DatePicker date={endDate!} setDate={setEndDate} /> */}
					<Input
						type='date'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className='mt-4 w-[280px]'
					/>
					<br />
					<Input
						type='time'
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						className='mt-4 w-[280px]'
					/>
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
