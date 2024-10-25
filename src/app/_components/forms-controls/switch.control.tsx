'use client'

import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

interface SwitchProps {
    name: string
    onChange?: (checked: boolean) => void
    defaultChecked?: boolean
}

export default function SwitchControl({ name, onChange, defaultChecked = false }: SwitchProps) {
    const [checked, setChecked] = useState(defaultChecked)

    const handleChange = (checked: boolean) => {
        setChecked(checked)
        onChange?.(checked)
    }

    return <Switch name={name} checked={checked} onCheckedChange={handleChange} />
}
