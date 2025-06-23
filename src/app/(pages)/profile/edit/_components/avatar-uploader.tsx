'use client'

import { Button } from '@/components/ui/button'
import { CameraIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import type { ChangeEvent } from 'react'
import { useState } from 'react'
import AvatarUploadIcon from './avatar-upload-icon'

export interface AvatarUploaderProps {
    name: string
    defaultValue?: string // current avatar URL received from the server (if any)
    onChange?: (data: string) => void
}

export default function AvatarUploader({ name, defaultValue, onChange }: AvatarUploaderProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(defaultValue)

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
            onChange?.('avatar')
        }
    }

    const handleRemove = () => {
        setAvatarPreview(undefined)
        onChange?.('avatar')
    }

    return (
        <div className='flex flex-col'>
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
                    <Image
                        src={avatarPreview}
                        alt='Avatar preview'
                        className='rounded-full object-cover'
                        sizes='(max-width: 768px) 100vw, 109px'
                        fill
                        priority
                    />
                    <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100'>
                        <div className='absolute inset-0 rounded-full bg-black opacity-50' />
                        <Button
                            size='icon'
                            variant='outline'
                            className='z-10 m-1 bg-white'
                            type='button'
                            onClick={() => document.getElementById(name)?.click()}>
                            <CameraIcon />
                        </Button>
                        <Button
                            size='icon'
                            variant='destructive'
                            className='z-10 m-1'
                            type='button'
                            onClick={handleRemove}>
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
