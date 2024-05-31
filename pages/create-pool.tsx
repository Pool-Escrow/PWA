import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function CreatePoolPage() {
	// save the current form values in the state:
	const [bannerImage, setBannerImage] = useState('')
	const [name, setName] = useState('')
	const [mainHost, setMainHost] = useState('')
	const [coHosts, setCoHosts] = useState('')
	const [date, setDate] = useState('')
	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [softCap, setSoftCap] = useState('')
	const [termsUrl, setTermsUrl] = useState('')

	const handleFormSubmission = async (e: any) => {
		e.preventDefault()
		e.stopPropagation()
		await new Promise((resolve) => setTimeout(resolve, 1000))
		console.log('creating pool')

		const formValues = {
			name,
			mainHost,
			coHosts,
			date,
			description,
			price,
			softCap,
			termsUrl,
		}
		console.log(formValues)
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
							Update a banner photo; ideal aspect ratio is 2:1.
						</p>
						<Input
							value={bannerImage}
							onChange={(e) => setBannerImage(e.target.value)}
						/>
					</div>

					{/* Name */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>Name</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Update a banner photo; ideal aspect ratio is 2:1.
						</p>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</div>

					{/* Main Host */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Main Host
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Update a banner photo; ideal aspect ratio is 2:1.
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
							Update a banner photo; ideal aspect ratio is 2:1.
						</p>
						<Input
							value={coHosts}
							onChange={(e) => setCoHosts(e.target.value)}
						/>
					</div>

					{/* Date of Event */}
					<div>
						<Label className='text-base font-medium text-[#090909]'>
							Date of Event
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Update a banner photo; ideal aspect ratio is 2:1.
						</p>
						<Input value={date} onChange={(e) => setDate(e.target.value)} />
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
						<Label className='text-base font-medium text-[#090909]'>
							Choose Image
						</Label>
						<p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>
							Update a banner photo; ideal aspect ratio is 2:1.
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
						<Input
							value={softCap}
							onChange={(e) => setSoftCap(e.target.value)}
						/>
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
					type='submit'
					className='bottom-6 left-1/2 w-[345px] rounded-[32px] bg-gradient-to-b from-[#36A0F7] to-[#1364DA] py-[11px] shadow-[inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)]'
				>
					Create Pool
				</Button>
			</form>
		</div>
	)
}
