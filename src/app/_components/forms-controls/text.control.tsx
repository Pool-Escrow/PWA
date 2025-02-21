import { Input } from '../ui/input'

export interface TextProps {
    name: string
    onChange?: (value: string) => void
    defaultValue?: string,
    required?: boolean
}

export default function Text({ name, onChange, defaultValue, required }: TextProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value)
    }

    return (
        <Input
            required={required}
            className='bg-transparent'
            type='text'
            autoComplete='off'
            name={name}
            onChange={handleChange}
            defaultValue={defaultValue}
        />
    )
}
