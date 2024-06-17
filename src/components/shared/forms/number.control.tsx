import { Input } from '@/components/ui/input'

export type NumberValue = string

interface NumberProps {
	value: NumberValue
	setValue: React.Dispatch<React.SetStateAction<NumberValue>>
}

/**
 * A React component that renders an input field for entering whole numbers.
 * - Disallows leading zeros except when the field is empty.
 * - Accepts only integer values.
 * - Prevents non-numeric characters (including ',', '.', 'e').
 * - Enables backspace and clearing the field (sets value to 0).
 *
 * @param {Object} props - The component props.
 * @param {FieldApi<unknown, string, never, never, string>} props.field - The field API object from `@tanstack/react-form` library.
 * @param {string} props.id - The unique identifier for the input field.
 *
 * @example
 * <Number field={form.getField('count')} id="count-input" />
 */
export const Number = ({ value, setValue }: NumberProps) => {
	const max = 99999
	const isMax = parseFloat(value) > max

	const handleChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLInputElement>) => {
		const isEmpty = value === ''
		const isZero = parseInt(value) === 0
		const isNumber = /^\d+$/.test(value)
		const isValueShort = value.length < 6

		if (isValueShort && (isEmpty || isZero || isNumber)) {
			setValue(value)
		}
	}

	const handleBlur = () => {
		setValue(value || '0')
	}

	return (
		<Input
			className='bg-transparent'
			inputMode='numeric'
			onChange={handleChange}
			onBlur={handleBlur}
			type='text' // Use text type to prevent browser behavior with decimals/commas
			value={isMax ? max : value}
		/>
	)
}
