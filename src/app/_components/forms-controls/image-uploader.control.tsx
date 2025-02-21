'use client'

import { Button } from '../ui/button'
import Image from 'next/image'
import ImageUploadIcon from '../icons/image-upload.icon'
import { CameraIcon, Trash2Icon } from 'lucide-react'
import { useState, ChangeEvent } from 'react'

export interface ImageUploaderProps {
    name: string
    onChange?: (file: File | null) => void,
    required?: boolean
}

export default function ImageUploader({ name, onChange, required }: ImageUploaderProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onChange?.(file)
        } else {
            setImagePreview(null)
            onChange?.(null)
        }
    }

    const handleRemove = () => {
        setImagePreview(null)
        onChange?.(null)
    }

    return (
        <>
            <input
                required={required}
                placeholder='Choose an image'
                title='Choose an image'
                id={name}
                name={name}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageChange}
            />
            {imagePreview ? (
                <div className='relative size-32 overflow-hidden rounded-xl'>
                    <Image
                        src={imagePreview}
                        alt='Image preview'
                        className='rounded-xl object-cover object-center'
                        fill
                    />
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100'>
                        <div className='absolute inset-0 rounded-xl bg-black opacity-50'></div>
                        <Button
                            size='icon'
                            variant='outline'
                            className='z-10 m-1 bg-white'
                            onClick={() => document.getElementById(name)?.click()}>
                            <CameraIcon />
                        </Button>
                        <Button size='icon' variant='destructive' className='z-10 m-1' onClick={handleRemove}>
                            <Trash2Icon />
                        </Button>
                    </div>
                </div>
            ) : (
                <label
                    htmlFor={name}
                    className='flex size-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EBEBEB]'>
                    <ImageUploadIcon />
                    <p className='text-center text-xs font-normal text-[#B2B2B2]'>Select an Image</p>
                </label>
            )}
        </>
    )
}
