'use client'

import { useState } from 'react'
import { Textarea } from '../ui/textarea'

interface TextAreaProps {
    name: string
}

export default function TextArea({ name }: TextAreaProps) {
    const [value, setValue] = useState('')
    const maxLength = 500

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value)
    }

    return (
        <div className='relative'>
            <Textarea
                className='content-size resize-y rounded-[20px] p-6 pb-10 font-normal leading-tight text-black backdrop-blur-[2px]'
                maxLength={maxLength}
                value={value}
                name={name}
                onChange={handleChange}
            />
            <div className='absolute bottom-2 right-2 w-auto rounded-full bg-[#fffd] px-1 text-right text-xs font-medium text-[#B2B2B2]'>
                {value.length}/{maxLength}
            </div>
        </div>
    )
}
