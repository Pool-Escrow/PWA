'use client'

import ImageUploadIcon from '@/components/icons/image-upload.icon'
import { Button } from '@/components/ui/button'
import { convertAndResizeToBase64 } from '@/lib/utils/convert-image'
import Image from 'next/image'
import { useRef } from 'react'

export type ImageUploaderValue = string

interface ImageUploaderProps {
	value: ImageUploaderValue
	setValue: React.Dispatch<React.SetStateAction<ImageUploaderValue>>
}

export const ImageUploader = ({ value, setValue }: ImageUploaderProps) => {
	const hoverRef = useRef<HTMLInputElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)

	const handleImageLoad = (e: React.MouseEvent) => {
		e.preventDefault()
		inputRef.current!.click()
	}

	const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async ({
		target: { files },
	}) => {
		const base64Image = await convertAndResizeToBase64(files![0])
		setValue(base64Image)
		//  reset the input value so that the same image can be selected again
		inputRef.current!.value = ''
		if (hoverRef.current) hoverRef.current.hidden = true
	}

	const ImagePreview = () => {
		return (
			<div
				className='relative size-32 items-center justify-center overflow-hidden rounded-xl'
				onTouchStart={() => {
					if (hoverRef.current) hoverRef.current.hidden = false
				}}
				onMouseEnter={() => {
					if (hoverRef.current) hoverRef.current.hidden = false
				}}
				onMouseLeave={() => {
					if (hoverRef.current) hoverRef.current.hidden = true
				}}
			>
				<Image
					alt='image'
					height={128}
					width={128}
					src={value}
					className='rounded-xl'
					priority
				/>
				<div ref={hoverRef} hidden>
					<div className='w-32 absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/50'>
						<Button
							size='sm'
							variant='outline'
							className='m-2 rounded-full'
							onClick={handleImageLoad}
						>
							Change
						</Button>
						<Button
							size='sm'
							variant='destructive'
							className='m-2 rounded-full'
							onClick={() => setValue('')}
						>
							Remove
						</Button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			{value ? (
				<ImagePreview />
			) : (
				<div
					className='flex w-32 flex-col items-center justify-around rounded-xl border-2 border-dashed border-[#EBEBEB] p-8 hover:cursor-pointer'
					onClick={handleImageLoad}
				>
					<ImageUploadIcon />
					<p className='text-center text-xs font-normal text-[#B2B2B2]'>
						Select an Image
					</p>
				</div>
			)}
			<input
				className='hidden'
				ref={inputRef}
				onChange={handleImageChange}
				type='file'
				accept='image/*'
			/>
		</>
	)
}
