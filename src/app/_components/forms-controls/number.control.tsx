'use client'

import { useState, useEffect } from 'react'
import { Input } from '../ui/input'

interface NumberProps {
    name: string
    defaultValue?: string,
    required: boolean
}

export default function Number({ name, defaultValue = '', required }: NumberProps) {
    const [value, setValue] = useState(defaultValue)
    const max = 99999
    const isMax = parseFloat(value) > max

    useEffect(() => {
        // This effect will update the internal state if the defaultValue prop changes
        setValue(defaultValue)
    }, [defaultValue])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        const isEmpty = newValue === ''
        const isZero = parseInt(newValue) === 0
        const isNumber = /^\d+$/.test(newValue)
        const isValueShort = newValue.length < 6

        if (isValueShort && (isEmpty || isZero || isNumber)) {
            setValue(newValue)
        }
    }

    const handleBlur = () => {
        setValue(value || '0')
    }

    return (
        <Input
            required={required}
            className='bg-transparent'
            inputMode='numeric'
            onChange={handleChange}
            onBlur={handleBlur}
            type='text'
            value={isMax ? max.toString() : value}
            name={name}
        />
    )
}
