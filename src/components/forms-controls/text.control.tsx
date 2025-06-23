import { Input } from '../ui/input'

export interface TextProps {
    name: string
    value?: string
    onChange?: (value: string) => void
    errors?: string[]
}

export default function Text({ name, onChange, value, errors }: TextProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value)
    }

    return (
        <div>
            <Input
                className='bg-transparent'
                type='text'
                autoComplete='off'
                name={name}
                onChange={handleChange}
                value={value || ''}
            />
            {errors && errors.length > 0 && <p className='mt-1 text-xs text-red-500'>{errors.join(', ')}</p>}
        </div>
    )
}
