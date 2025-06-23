'use client'

import { Switch } from '@/components/ui/switch'
import { useEffect, useState } from 'react'

interface SwitchProps {
    name: string
    value?: boolean
    onChange?: (checked: boolean) => void
    errors?: string[]
}

export default function SwitchControl({ name, value = false, onChange, errors }: SwitchProps) {
    const [checked, setChecked] = useState(value)

    useEffect(() => {
        setChecked(value)
    }, [value])

    const handleChange = (checked: boolean) => {
        setChecked(checked)
        onChange?.(checked)
    }

    return (
        <div>
            <Switch name={name} checked={checked} onCheckedChange={handleChange} />
            {errors && errors.length > 0 && <p className='mt-1 text-xs text-red-500'>{errors.join(', ')}</p>}
        </div>
    )
}
