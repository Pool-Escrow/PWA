'use client'

import { Button } from '@/components/ui/button'
import { convertAndResizeToBase64 } from '@/lib/utils/convert-image'
import { CameraIcon, Trash2Icon } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import AvatarUploadIcon from '../icons/avatar-upload.icon'

export type AvatarUploaderValue = string

interface AvatarUploaderProps {
    value: AvatarUploaderValue
    setValue: React.Dispatch<React.SetStateAction<AvatarUploaderValue>>
}

export const AvatarUploader = ({ value, setValue }: AvatarUploaderProps) => {
    const hoverRef = useRef<HTMLInputElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleImageLoad = (e: React.MouseEvent) => {
        e.preventDefault()
        inputRef.current!.click()
    }

    const handleImageChange: React.ChangeEventHandler<HTMLInputElement> = async ({ target: { files } }) => {
        const base64Image = await convertAndResizeToBase64(files![0])
        setValue(base64Image)
        //  reset the input value so that the same image can be selected again
        inputRef.current!.value = ''
        if (hoverRef.current) hoverRef.current.hidden = true
    }

    return (
        <>
            {' '}
            {value ? (
                <div
                    className='relative size-[109px] items-center justify-center overflow-hidden rounded-full'
                    onTouchStart={() => {
                        if (hoverRef.current) hoverRef.current.hidden = false
                    }}
                    onMouseEnter={() => {
                        if (hoverRef.current) hoverRef.current.hidden = false
                    }}
                    onMouseLeave={() => {
                        if (hoverRef.current) hoverRef.current.hidden = true
                    }}>
                    <Image alt='image' height={109} width={109} src={value} className='rounded-full' priority />
                    <div ref={hoverRef} hidden>
                        <div className='absolute inset-0 flex size-[109px] flex-col items-center justify-center rounded-full bg-black/50'>
                            <Button
                                size='icon'
                                variant='outline'
                                className='m-2 rounded-full'
                                onClick={handleImageLoad}>
                                <CameraIcon />
                            </Button>
                            <Button
                                size='icon'
                                variant='destructive'
                                className='m-2 rounded-full'
                                onClick={() => setValue('')}>
                                <Trash2Icon />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div
                    className='flex size-[109px] flex-col items-center justify-around rounded-full bg-[#2989EC] p-8 hover:cursor-pointer'
                    onClick={handleImageLoad}>
                    <AvatarUploadIcon />
                </div>
            )}
            <input
                title='avatar upload control'
                className='hidden'
                ref={inputRef}
                onChange={handleImageChange}
                type='file'
                accept='image/*'
            />
        </>
    )
}
