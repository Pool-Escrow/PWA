'use client'

import { Button } from '@/app/pwa/_components/ui/button'
import Image from 'next/image'
import AvatarUploadIcon from './avatar-upload-icon'
import { CameraIcon, Trash2Icon } from 'lucide-react'
import { useState, ChangeEvent } from 'react'

export interface AvatarUploaderProps {
    name: string
    onChange?: (file: File | null) => void
    defaultValue?: string
}

export default function AvatarUploader({ name, onChange, defaultValue }: AvatarUploaderProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(defaultValue || null)

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onChange?.(file)
        } else {
            setAvatarPreview(null)
            onChange?.(null)
        }
    }

    const handleRemove = () => {
        setAvatarPreview(null)
        onChange?.(null)
    }

    return (
        <div className='flex flex-col items-center'>
            <input
                placeholder='Choose an image'
                title='Choose an image'
                id={name}
                name={name}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageChange}
            />
            {avatarPreview ? (
                <div className='relative size-[109px]'>
                    <Image src={avatarPreview} alt='Avatar preview' className='rounded-full object-cover' fill />
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100'>
                        <div className='absolute inset-0 rounded-full bg-black opacity-50'></div>
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
                    className='flex size-[109px] cursor-pointer flex-col items-center justify-center rounded-full bg-[#2989EC]'>
                    <AvatarUploadIcon />
                </label>
            )}
        </div>
    )
}
