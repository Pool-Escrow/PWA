'use client'

import {
	CurrencyAmount,
	CurrencyAmountValue,
} from '@/components/shared/forms/currency-amount.control'
import {
	DateTimeRange,
	DateTimeRangeValue,
} from '@/components/shared/forms/date-time-range.control'
import { ImageUploader } from '@/components/shared/forms/image-uploader.control'
import {
	MultiSelect,
	MultiSelectValue,
} from '@/components/shared/forms/multi-select.control'
import { Number, NumberValue } from '@/components/shared/forms/number.control'
import {
	TextArea,
	TextAreaValue,
} from '@/components/shared/forms/text-area.control'
import { Text } from '@/components/shared/forms/text.control'
import { Url, UrlValue } from '@/components/shared/forms/url.control'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CreatePoolPage() {
	const [bannerImage, setBannerImage] = useState('')
	const [name, setName] = useState('')
	const [mainHost, setMainHost] = useState('')
	const [coHosts, setCoHosts] = useState<MultiSelectValue>([])
	const [date, setDate] = useState<DateTimeRangeValue>({
		start: new Date().toISOString(),
		end: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
	})
	const [description, setDescription] = useState<TextAreaValue>('')
	const [price, setPrice] = useState<CurrencyAmountValue>('')
	const [softCap, setSoftCap] = useState<NumberValue>('')
	const [termsUrl, setTermsUrl] = useState<UrlValue>('')
	const router = useRouter()

	// const { currentJwt: jwt } = useCookie()
	const { toast } = useToast()

	const createPoolServerMutation = useMutation({
		// mutationFn: handleCreatePoolServer,
		onSuccess: () => {
			console.log('createPoolServerMutation Success')
			router.push('/admin')
		},
		onError: () => {
			console.log('registerMutation Error')
		},
	})

	const createPoolMutation = useMutation({
		// mutationFn: handleCreatePool,
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
			// createPoolServerMutation.mutate({
			// 	params: [
			// 		selectedFile?.name,
			// 		selectedFile?.type,
			// 		selectedFileBase64,
			// 		startTimestamp,
			// 		endTimestamp,
			// 		name,
			// 		description,
			// 		price,
			// 		softCap,
			// 		'0',
			// 		tokenAddress,
			// 		mainHost,
			// 		coHosts.split(','),
			// 		termsUrl,
			// 		currentJwt ?? ' ',
			// 	],
			// })
		},
		onError: (error) => {
			console.log('createPoolMutation Error')
			console.error(error)
		},
	})

	const handleFormSubmission = async (e: any) => {
		e.preventDefault()
		e.stopPropagation()
		// if (!jwt) {
		// 	toast({
		// 		title: 'Error',
		// 		description: 'You must be Admin to create a pool.',
		// 	})
		// 	return
		// }

		toast({ title: 'Creating Pool', description: 'Please wait...' })
		// createPoolMutation.mutate({
		// 	params: [
		// 		startTimestamp,
		// 		endTimestamp,
		// 		name,
		// 		price,
		// 		'0',
		// 		tokenAddress,
		// 		wallets,
		// 	],
		// })
	}

	return (
		<div className='mt-8 px-6'>
			<div className='text-center text-base font-medium leading-normal text-[#090909]'>
				Create Pool
			</div>
			<form
				className='flex w-full flex-col gap-6 py-6'
				onSubmit={async (e) => {
					await handleFormSubmission(e)
				}}
			>
				<section className='flex flex-1 flex-col gap-6'>
					{/* Banner Image */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Choose Image
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Update a banner photo; ideal aspect ratio is 2:1
						</p>
						<ImageUploader value={bannerImage} setValue={setBannerImage} />
					</div>

					{/* Name */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Name of Pool
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Enter a name for your Pool
						</p>
						<Text value={name} setValue={setName} />
					</div>

					{/* Main Host */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Name of Host
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Enter the host name
						</p>
						<Text value={mainHost} setValue={setMainHost} />
					</div>

					{/* Co-Hosts  */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Add Co-Host
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Please add your Co-Host
						</p>
						<MultiSelect value={coHosts} setValue={setCoHosts} />
					</div>

					{/* Date of Event */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Date of Event
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Select the date and time of the Pool
						</p>
						<DateTimeRange value={date} setValue={setDate} />
					</div>

					{/* Description */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Description
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Enter a description for your Pool
						</p>
						<TextArea value={description} setValue={setDescription} />
					</div>

					{/* Price */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Price
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							What is the price to participate in the Pool?
						</p>
						<CurrencyAmount value={price} setValue={setPrice} />
					</div>

					{/* Soft Cap */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Soft Cap
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Enter the max amount of paid entries allowed to join
						</p>
						<Number value={softCap} setValue={setSoftCap} />
					</div>

					{/* Terms URL */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Link To Rules, Terms, and Conditions
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Paste a link to your rules
						</p>
						<Url value={termsUrl} setValue={setTermsUrl} />
					</div>
				</section>
				<Button
					type='submit'
					className='bottom-6 left-1/2 w-[345px] rounded-[32px] bg-gradient-to-b from-[#36A0F7] to-[#1364DA] py-[11px] shadow-[inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]'
				>
					Create Pool
				</Button>
			</form>
		</div>
	)
}
