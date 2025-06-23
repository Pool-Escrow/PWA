'use client'

import { useEffect, useState } from 'react'
import { Textarea } from '../ui/textarea'

interface TextAreaProps {
    name: string
    value?: string
    onChange?: (value: string) => void
    errors?: string[]
}

export default function TextArea({ name, value: initialValue, onChange, errors = [] }: TextAreaProps) {
    const [value, setValue] = useState(initialValue || '')
    const maxLength = 500
    const hasErrors = errors.length > 0

    // Update internal state when initial value changes
    useEffect(() => {
        if (initialValue !== undefined) {
            setValue(initialValue)
        }
    }, [initialValue])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setValue(newValue)
        onChange?.(newValue)
    }

    return (
        <div className='relative'>
            <Textarea
                className={`content-size resize-y rounded-[20px] p-6 pb-10 font-normal leading-tight text-black backdrop-blur-[2px] ${
                    hasErrors ? 'border-red-500' : ''
                }`}
                maxLength={maxLength}
                value={value}
                name={name}
                onChange={handleChange}
                aria-invalid={hasErrors}
            />
            <div className='absolute bottom-2 right-2 w-auto rounded-full bg-[#fffd] px-1 text-right text-xs font-medium text-[#B2B2B2]'>
                {value.length}/{maxLength}
            </div>
            {hasErrors && (
                <p className='mt-1 text-xs text-red-500' role='alert'>
                    {errors[0]}
                </p>
            )}
        </div>
    )
}
