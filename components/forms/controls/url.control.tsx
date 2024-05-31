import { Input } from '@/components/ui/input'

export type UrlValue = string

interface UrlProps {
	value: UrlValue
	setValue: React.Dispatch<React.SetStateAction<UrlValue>>
}

export const Url = ({ value, setValue }: UrlProps) => {
	return (
		<Input
			className='bg-transparent'
			type='url'
			inputMode='url'
			value={value}
			onChange={(e) => setValue(e.target.value)}
			placeholder='https://example.com/rules'
			autoComplete='off'
		/>
	)
}
