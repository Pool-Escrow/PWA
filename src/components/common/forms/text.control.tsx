import { Input } from '@/components/ui/input'

export type TextValue = string

interface TextProps {
	value: TextValue
	setValue: React.Dispatch<React.SetStateAction<TextValue>>
}

export const Text = ({ value, setValue }: TextProps) => {
	return (
		<Input
			className='bg-transparent'
			type='text'
			value={value}
			onChange={(e) => setValue(e.target.value)}
			autoComplete='off'
		/>
	)
}
