'use client'

import { useState } from 'react'
import { Input } from '../ui/input'

interface CurrencyAmountProps {
    name: string
}

export default function CurrencyAmount({ name }: CurrencyAmountProps) {
    const [value, setValue] = useState('')
    const max = 9999.99
    const isMax = parseFloat(value) > max

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        const isEmpty = newValue === ''
        const isZero = parseInt(newValue) === 0
        const isUniqueDotOrComma = newValue.match(/[.,]/g)?.length === 1
        const isNumber = /^\d+$/.test(newValue)
        const isValueShort = newValue.length < 8

        if (isValueShort && (isEmpty || isZero || isNumber || isUniqueDotOrComma)) {
            setValue(newValue.replace(',', '.'))
        }
    }

    const handleBlur = () => {
        // Format the value to two decimal places on blur
        const formattedValue = parseFloat(value || '0').toFixed(2) // This already ensures two decimal places

        setValue(formattedValue)
    }

    return (
        <Input
            className='no-spinner bg-transparent'
            inputMode='decimal'
            onBlur={handleBlur}
            onChange={handleChange}
            pattern='[0-9]*\.[0-9]{0,2}'
            startAdornment='$'
            type='text'
            value={isMax ? max.toString() : value}
            name={name}
        />
    )
}
